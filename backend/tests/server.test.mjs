import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, request } from 'node:http';
import { randomUUID } from 'node:crypto';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import { createHandler, deliver, parseAcknowledgement, validateRequest } from '../server.mjs';
const sample=()=>({kind:'order',name:'Тестовый заказчик',email:'test@example.com',message:'Нужен макет этикетки для тестового продукта.',service:'label',serviceName:'Forged',quantity:2,urgent:false,consent:true,size:'A5',colors:'зелёный',references:'https://example.com',website:'',requestId:randomUUID()});
async function withServer(options,run){const server=createServer(createHandler(options));await new Promise(r=>server.listen(0,'127.0.0.1',r));try{await run(`http://127.0.0.1:${server.address().port}`);}finally{await new Promise(r=>server.close(r));}}
const post=(url,data,headers={})=>fetch(url+'/api/requests',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(data)});

test('portfolio video supports seeking, suffix ranges, HEAD and caption MIME',async()=>{
 const root=await mkdtemp(join(tmpdir(),'sloy-media-'));
 try{
  await writeFile(join(root,'sample.mp4'),Buffer.from('0123456789'));
  await writeFile(join(root,'sample.vtt'),'WEBVTT\n');
  await withServer({root},async url=>{
   let r=await fetch(url+'/sample.mp4',{headers:{Range:'bytes=2-5'}});assert.equal(r.status,206);assert.equal(r.headers.get('Content-Type'),'video/mp4');assert.equal(r.headers.get('Content-Range'),'bytes 2-5/10');assert.equal(await r.text(),'2345');
   r=await fetch(url+'/sample.mp4',{headers:{Range:'bytes=-3'}});assert.equal(await r.text(),'789');
   r=await fetch(url+'/sample.mp4',{headers:{Range:'bytes=20-'}});assert.equal(r.status,416);
   r=await fetch(url+'/sample.mp4',{method:'HEAD'});assert.equal(r.headers.get('Content-Length'),'10');assert.equal(await r.text(),'');
   r=await fetch(url+'/sample.vtt');assert.equal(r.headers.get('Content-Type'),'text/vtt; charset=utf-8');
  });
 }finally{await rm(root,{recursive:true,force:true});}
});
test('validation rejects absent consent, invalid email, fractional quantities and unknown services',()=>{
 assert.equal(validateRequest(sample()),null);
 for(const update of [{consent:false},{email:'wrong'},{quantity:1.5},{service:'fake'},{message:'short'},{urgent:'true'},{name:['x']}])assert.notEqual(validateRequest({...sample(),...update}),null);
});
test('strict positive acknowledgements, including legacy double-encoded JSON',()=>{
 assert.equal(parseAcknowledgement('{"status":"success"}'),true);
 assert.equal(parseAcknowledgement(JSON.stringify(JSON.stringify({status:'success'}))),true);
 for(const body of ['{}','{"status":"failed"}','{"ok":false}','[]','{"ok":true,"status":"failed"}','{"status":"success","ok":false}'])assert.equal(Boolean(parseAcknowledgement(body)),false);
});
test('unconfigured form returns 503 without transmission',async()=>{
 let sends=0;await withServer({ready:false,send:async()=>sends++},async url=>{const r=await post(url,sample());assert.equal(r.status,503);assert.equal((await r.json()).ok,false);});assert.equal(sends,0);
});
test('a specific service and full brief reach the adapter; concurrent retry is delivered once',async()=>{
 let sends=0,received;
 await withServer({ready:true,send:async data=>{received=data;sends++;await new Promise(r=>setTimeout(r,40));}},async url=>{
  const data=sample();const responses=await Promise.all([post(url,data),post(url,data)]);
  assert(responses.every(r=>r.status===200));assert.equal(sends,1);
  assert.equal(received.serviceName,'Этикетка или ценник');assert.equal(received.quantity,2);assert.equal(received.consent,true);assert.equal(received.size,'A5');
  const r=await post(url,{...data,message:data.message+' Новый текст'});assert.equal(r.status,409);
 });
});
test('upstream errors do not become success, and retry can recover',async()=>{
 let fail=true;await withServer({ready:true,send:async()=>{if(fail)throw Error('UPSTREAM');}},async url=>{const data=sample();let r=await post(url,data);assert.equal(r.status,502);assert.equal((await r.json()).ok,false);fail=false;r=await post(url,data);assert.equal(r.status,200);});
});
test('cross-site, invalid body and honeypot never deliver',async()=>{
 let sends=0;await withServer({ready:true,send:async()=>sends++},async url=>{
  assert.equal((await post(url,sample(),{Origin:'https://untrusted.example'})).status,403);
  assert.equal((await post(url,{...sample(),website:'spam'})).status,400);
  assert.equal((await post(url,{...sample(),consent:false})).status,400);
  assert.equal((await post(url,{...sample(),message:'x'.repeat(25000)})).status,413);
 });assert.equal(sends,0);
});
test('independent webhook preserves the brief and requires acknowledgement',async()=>{
 const data=sample();data.serviceName='Дизайн этикетки';let captured;
 await deliver(data,{env:{REQUEST_PROVIDER:'webhook',REQUEST_WEBHOOK_URL:'https://example.com/requests'},fetchImpl:async(url,init)=>{captured=init;return new Response('{"ok":true}');}});
 assert.deepEqual(JSON.parse(captured.body),data);
 await assert.rejects(deliver(data,{env:{REQUEST_PROVIDER:'webhook',REQUEST_WEBHOOK_URL:'https://example.com'},fetchImpl:async()=>new Response('{}')}));
 await assert.rejects(deliver(data,{env:{REQUEST_PROVIDER:'legacy'}}));
});
test('a UTF-8 character split across network chunks preserves the Russian brief',async()=>{
 let received;
 await withServer({ready:true,send:async data=>{received=data;}},async url=>{
  const data=sample(),body=Buffer.from(JSON.stringify(data));
  const split=body.indexOf(Buffer.from('Т'))+1;
  const status=await new Promise((resolve,reject)=>{
   const req=request(url+'/api/requests',{method:'POST',headers:{'Content-Type':'application/json'}},res=>{res.resume();res.on('end',()=>resolve(res.statusCode));});
   req.on('error',reject);req.write(body.subarray(0,split));setTimeout(()=>req.end(body.subarray(split)),20);
  });
  assert.equal(status,200);
  assert.equal(received.name,data.name);
  assert.equal(received.message,data.message);
 });
});
test('a confirmed request can be retried at the submission limit without duplicate delivery',async()=>{
 let sends=0;
 await withServer({ready:true,send:async()=>sends++},async url=>{
  const first=sample();
  assert.equal((await post(url,first)).status,200);
  for(let i=1;i<15;i++)assert.equal((await post(url,sample())).status,200);
  assert.equal((await post(url,first)).status,200);
  assert.equal((await post(url,sample())).status,429);
  assert.equal(sends,15);
 });
});
