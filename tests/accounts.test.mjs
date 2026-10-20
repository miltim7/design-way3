import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHandler } from '../server.mjs';
import { createAccountStore } from '../src/accounts.mjs';

const sample = () => ({name:'Тестовый заказчик',email:'test@example.invalid',phone:'',company:'Студия',timezone:'Europe/Moscow',password:'test-long-password-123',consent:true,agreement:true});
async function fixture(run) {
  const dir = await mkdtemp(join(tmpdir(), 'sloy-accounts-'));
  const file = join(dir, 'accounts.json');
  let server, base;
  async function start() {
    server = createServer(createHandler({ accountStore: createAccountStore(file) }));
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    base = `http://127.0.0.1:${server.address().port}`;
  }
  async function stop() { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
  await start();
  const api = (route, body, cookie = '', extra = {}) => fetch(`${base}/api/auth/${route}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {Origin:base,'Content-Type':'application/json',Cookie:cookie,...extra},
    ...(body === undefined ? {} : {body:JSON.stringify(body)})
  });
  try { await run({api,file, restart:async()=>{await stop();await start();},page:path=>fetch(`${base}${path}`,{redirect:'manual'})}); }
  finally { await stop(); await rm(dir,{recursive:true,force:true}); }
}
const cookieOf = response => response.headers.get('set-cookie').split(';')[0];

test('register, persist hashed credentials, restart, login, profile and logout', async () => fixture(async ({api,file,restart,page})=>{
  assert.equal((await page('/account/')).headers.get('location'),'/sign-in/');
  assert.equal((await api('me')).status,401);
  const registration = await api('register',sample());
  assert.equal(registration.status,201);
  assert.match(registration.headers.get('set-cookie'),/HttpOnly; SameSite=Lax/);
  const cookie = cookieOf(registration);
  const result = await registration.json();
  assert.equal(result.user.email,'test@example.invalid');
  assert.equal(result.user.password,undefined);
  const raw = await readFile(file,'utf8');
  assert(!raw.includes(sample().password));
  assert(!raw.includes(cookie.split('=')[1]));
  await restart();
  assert.equal((await api('me',undefined,cookie)).status,200);
  const updated = await api('profile',{...sample(),name:'Новое имя',company:'Новая компания'},cookie);
  assert.equal((await updated.json()).user.name,'Новое имя');
  assert.equal((await api('logout',{},cookie)).status,200);
  assert.equal((await api('me',undefined,cookie)).status,401);
  assert.equal((await api('login',{email:sample().email,password:'incorrect'})).status,401);
  const login = await api('login',{email:'TEST@example.invalid',password:sample().password});
  assert.equal(login.status,200);
  assert.equal((await (await api('me',undefined,cookieOf(login))).json()).user.name,'Новое имя');
}));

test('registration validates consent, profile, passwords and concurrent duplicate email', async () => fixture(async ({api})=>{
  for (const change of [{consent:false},{agreement:false},{email:'bad'},{timezone:'Fake/Zone'},{password:'short'},{name:''},{phone:12}]) {
    assert.equal((await api('register',{...sample(),...change})).status,400);
  }
  const results = await Promise.all([api('register',sample()),api('register',{...sample(),email:'TEST@example.invalid'})]);
  assert.deepEqual(results.map(r=>r.status).sort(),[201,409]);
}));

test('password change revokes other sessions, rejects old password, preserves current login', async () => fixture(async ({api})=>{
  const first = cookieOf(await api('register',sample()));
  const second = cookieOf(await api('login',{email:sample().email,password:sample().password}));
  assert.equal((await api('password',{currentPassword:'wrong',password:'new-long-password-456'},first)).status,400);
  const changed = await api('password',{currentPassword:sample().password,password:'new-long-password-456'},first);
  assert.equal(changed.status,200);
  assert.equal((await api('me',undefined,second)).status,401);
  assert.equal((await api('me',undefined,first)).status,401);
  assert.equal((await api('me',undefined,cookieOf(changed))).status,200);
  assert.equal((await api('login',{email:sample().email,password:sample().password})).status,401);
  assert.equal((await api('login',{email:sample().email,password:'new-long-password-456'})).status,200);
}));

test('auth rejects cross-origin, oversized bodies, unauthenticated changes and throttles login', async () => fixture(async ({api})=>{
  assert.equal((await api('register',sample(),'',{Origin:'https://other.example'})).status,403);
  assert.equal((await api('register',sample(),'',{Origin:''})).status,403);
  assert.equal((await api('register',{...sample(),name:'x'.repeat(9000)})).status,413);
  assert.equal((await api('profile',sample())).status,401);
  assert.equal((await api('me',undefined,'sloy_session=forged')).status,401);
  for (let i=0;i<25;i++) assert.equal((await api('login',{email:sample().email,password:'wrong'})).status,401);
  const blocked = await api('login',{email:sample().email,password:'wrong'});
  assert.equal(blocked.status,429);
  assert(blocked.headers.has('retry-after'));
}));

test('sessions expire server-side and profiles cannot cross between users', async () => fixture(async ({api,file,restart})=>{
  const alice = cookieOf(await api('register',sample()));
  const bob = cookieOf(await api('register',{...sample(),name:'Другой клиент',email:'other@example.invalid'}));
  await api('profile',{...sample(),name:'Изменённое имя'},alice);
  assert.equal((await (await api('me',undefined,bob)).json()).user.name,'Другой клиент');
  const {writeFile} = await import('node:fs/promises');
  const stored = JSON.parse(await readFile(file,'utf8'));
  stored.sessions.forEach(s=>{s.expires=Date.now()-1000;});
  await writeFile(file,JSON.stringify(stored));
  await restart();
  assert.equal((await api('me',undefined,alice)).status,401);
}));
