import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const scrypt = promisify(scryptCallback);
const cookieName = 'sloy_session';
const lifetime = 7 * 24 * 60 * 60 * 1000;
const digest = value => createHash('sha256').update(value).digest('hex');
const emailValid = value => typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const passwordValid = value => typeof value === 'string' && value.length >= 10 && value.length <= 128;
const fail = (status, message, field) => Object.assign(new Error(message), { status, field });
const publicUser = ({ id, name, email, phone, company, timezone, createdAt }) => ({ id, name, email, phone, company, timezone, createdAt });

function profile(data) {
  for (const [key, max] of [['name', 100], ['phone', 50], ['company', 200], ['timezone', 100]]) {
    if (typeof data[key] !== 'string' || data[key].length > max) throw fail(400, 'Проверьте поле.', key);
  }
  if (data.name.trim().length < 2) throw fail(400, 'Укажите имя: минимум 2 символа.', 'name');
  try { new Intl.DateTimeFormat('ru', { timeZone: data.timezone }).format(); }
  catch { throw fail(400, 'Выберите часовой пояс.', 'timezone'); }
  return Object.fromEntries(['name', 'phone', 'company', 'timezone'].map(key => [key, data[key].trim()]));
}
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  return { salt, hash: (await scrypt(password, salt, 64)).toString('hex') };
}
async function matches(password, record) {
  const actual = await scrypt(password, record.salt, 64);
  return timingSafeEqual(actual, Buffer.from(record.hash, 'hex'));
}
function sessionKey(req) {
  const token = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  return token && /^[a-f0-9]{64}$/.test(token) ? digest(token) : null;
}

// One Node process owns this store. Writes are serialized and atomically replace
// the previous file; failed writes never publish a partial in-memory state.
export function createAccountStore(file = resolve(process.env.ACCOUNT_DATA_FILE || 'data/accounts.json')) {
  let state, loading, queue = Promise.resolve();
  async function read() {
    if (state) return state;
    loading ||= (async () => {
      try {
        state = JSON.parse(await readFile(file, 'utf8'));
        if (state.version !== 1 || !Array.isArray(state.users) || !Array.isArray(state.sessions)) throw Error('Invalid account store');
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        state = { version: 1, users: [], sessions: [] };
      }
      return state;
    })();
    return loading;
  }
  return {
    async read() { await queue; return read(); },
    change(callback) {
      const operation = queue.then(async () => {
        const next = structuredClone(await read());
        next.sessions = next.sessions.filter(s => s.expires > Date.now());
        const result = await callback(next);
        await mkdir(dirname(file), { recursive: true });
        const temp = `${file}.${randomUUID()}.tmp`;
        await writeFile(temp, JSON.stringify(next), { mode: 0o600 });
        await rename(temp, file);
        state = next;
        return result;
      });
      queue = operation.catch(() => {});
      return operation;
    }
  };
}

export function createAccounts({ store = createAccountStore(), expectedOrigin } = {}) {
  const limits = new Map();
  // Equal-cost password checks also for an unknown address.
  const dummy = hashPassword(randomBytes(32).toString('hex'));
  async function current(req) {
    const key = sessionKey(req);
    if (!key) return null;
    const state = await store.read();
    const session = state.sessions.find(s => s.key === key && s.expires > Date.now());
    return session ? state.users.find(u => u.id === session.userId) || null : null;
  }
  function cookie(req, res, token, maxAge = lifetime / 1000) {
    const secure = expectedOrigin?.startsWith('https:') || req.socket.encrypted;
    res.setHeader('Set-Cookie', `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? '; Secure' : ''}`);
  }
  function addSession(state, userId, req) {
    const token = randomBytes(32).toString('hex');
    const oldKey = sessionKey(req);
    state.sessions = state.sessions.filter(s => s.key !== oldKey);
    state.sessions.push({ key: digest(token), userId, expires: Date.now() + lifetime });
    // Bound active sessions per user.
    const own = state.sessions.filter(s => s.userId === userId);
    const remove = new Set(own.slice(0, Math.max(0, own.length - 10)).map(s => s.key));
    state.sessions = state.sessions.filter(s => !remove.has(s.key));
    return token;
  }
  return {
    current,
    async handle(req, res, pathname, json) {
      if (!pathname.startsWith('/api/auth/')) return false;
      const route = pathname.slice('/api/auth/'.length);
      const methods = { me: 'GET', register: 'POST', login: 'POST', logout: 'POST', profile: 'POST', password: 'POST' };
      try {
        if (!methods[route]) throw fail(404, 'Страница не найдена.');
        if (req.method !== methods[route]) { res.setHeader('Allow', methods[route]); throw fail(405, 'Метод не поддерживается.'); }
        if (route === 'me') {
          const user = await current(req);
          if (!user) throw fail(401, 'Войдите в кабинет.');
          json(200, { ok: true, user: publicUser(user) });
          return true;
        }
        const origin = expectedOrigin || `http://${req.headers.host}`;
        if (req.headers.origin !== origin || req.headers['sec-fetch-site'] === 'cross-site') throw fail(403, 'Откройте форму на этом сайте и повторите.');
        if (!(req.headers['content-type'] || '').startsWith('application/json')) throw fail(415, 'Некорректный формат данных.');
        const now = Date.now();
        for (const [key, value] of limits) if (value.reset <= now) limits.delete(key);
        const limitKey = `${req.socket.remoteAddress}:${route}`;
        const limit = limits.get(limitKey) || { count: 0, reset: now + 600000 };
        if (limit.count >= (route === 'register' ? 10 : 25)) {
          res.setHeader('Retry-After', String(Math.ceil((limit.reset - now) / 1000)));
          throw fail(429, 'Слишком много попыток. Попробуйте через 10 минут.');
        }
        limit.count++; limits.set(limitKey, limit);
        const chunks = [];
        let bytes = 0;
        for await (const chunk of req) {
          bytes += chunk.length;
          if (bytes > 8192) throw fail(413, 'Слишком много данных. Сократите заполненные поля.');
          chunks.push(chunk);
        }
        let data;
        try { data = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw fail(400, 'Не удалось прочитать форму.'); }
        if (!data || typeof data !== 'object' || Array.isArray(data)) throw fail(400, 'Проверьте данные формы.');
        if (route === 'register') {
          const details = profile(data);
          if (!emailValid(data.email)) throw fail(400, 'Проверьте email.', 'email');
          if (!passwordValid(data.password)) throw fail(400, 'Пароль должен содержать от 10 до 128 символов.', 'password');
          if (data.consent !== true || data.agreement !== true) throw fail(400, 'Подтвердите согласие с условиями и обработкой данных.');
          const email = data.email.trim().toLowerCase();
          const password = await hashPassword(data.password);
          const result = await store.change(state => {
            if (state.users.some(u => u.email === email)) throw fail(409, 'Этот email уже зарегистрирован. Перейдите ко входу.', 'email');
            const user = { id: randomUUID(), ...details, email, password, createdAt: new Date().toISOString(), consentAt: new Date().toISOString() };
            state.users.push(user);
            return { user: publicUser(user), token: addSession(state, user.id, req) };
          });
          cookie(req, res, result.token);
          json(201, { ok: true, user: result.user });
        } else if (route === 'login') {
          if (!emailValid(data.email) || typeof data.password !== 'string' || !data.password || data.password.length > 128) throw fail(400, 'Укажите email и пароль.');
          const user = (await store.read()).users.find(u => u.email === data.email.trim().toLowerCase());
          const valid = await matches(data.password, user?.password || await dummy);
          if (!user || !valid) throw fail(401, 'Неверный email или пароль. Проверьте данные и повторите.');
          const token = await store.change(state => {
            const latest = state.users.find(u => u.id === user.id);
            if (latest.password.hash !== user.password.hash) throw fail(401, 'Пароль изменился. Войдите ещё раз.');
            return addSession(state, user.id, req);
          });
          cookie(req, res, token);
          json(200, { ok: true, user: publicUser(user) });
        } else if (route === 'logout') {
          await store.change(state => { state.sessions = state.sessions.filter(s => s.key !== sessionKey(req)); });
          cookie(req, res, '', 0);
          json(200, { ok: true });
        } else {
          const user = await current(req);
          if (!user) throw fail(401, 'Сессия закончилась. Войдите в кабинет снова.');
          if (route === 'profile') {
            const details = profile(data);
            const updated = await store.change(state => {
              const session = state.sessions.find(s => s.key === sessionKey(req) && s.expires > Date.now());
              if (!session) throw fail(401, 'Сессия закончилась. Войдите снова.');
              const target = state.users.find(u => u.id === user.id);
              Object.assign(target, details);
              return publicUser(target);
            });
            json(200, { ok: true, user: updated });
          } else {
            if (typeof data.currentPassword !== 'string' || data.currentPassword.length > 128 || !await matches(data.currentPassword, user.password)) throw fail(400, 'Текущий пароль указан неверно.', 'currentPassword');
            if (!passwordValid(data.password)) throw fail(400, 'Пароль должен содержать от 10 до 128 символов.', 'password');
            const password = await hashPassword(data.password);
            const token = await store.change(state => {
              const target = state.users.find(u => u.id === user.id);
              if (!state.sessions.some(s => s.key === sessionKey(req) && s.expires > Date.now()) || target.password.hash !== user.password.hash) throw fail(401, 'Войдите в кабинет снова.');
              target.password = password;
              state.sessions = state.sessions.filter(s => s.userId !== user.id);
              return addSession(state, user.id, req);
            });
            cookie(req, res, token);
            json(200, { ok: true });
          }
        }
      } catch (error) {
        json(error.status || 500, { ok: false, message: error.status ? error.message : 'Не удалось сохранить данные. Повторите попытку позже.', ...(error.field ? { field: error.field } : {}) });
      }
      return true;
    }
  };
}
