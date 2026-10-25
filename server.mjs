import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { site } from './src/config.mjs';
import { services, packages, directions } from './src/content.mjs';
import { createAccounts } from './src/accounts.mjs';

// Small dependency-free .env loader; never logs secrets.
try { for(const line of (await readFile(resolve('.env'),'utf8')).split(/\r?\n/)){const m=line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);if(m&&process.env[m[1]]===undefined)process.env[m[1]]=m[2].trim().replace(/^(['"])(.*)\1$/,'$2');} } catch(e){if(e.code!=='ENOENT')throw e;}
const serviceMap=new Map([...services.map(s=>[s.id,s.name]),...packages.map(p=>[`package-${p.id}`,`Ориентир бюджета «${p.name}»`]),...directions.filter(d=>['Посты для соцсетей','Иллюстрации','Дизайн мерча','Инфографика'].includes(d)).map((d,i)=>[`direction-${i}`,d]),['other','Другая задача']]);
export function validateRequest(data){
 if(!data||typeof data!=='object'||Array.isArray(data))return 'Некорректная заявка.';
 for(const [field,max] of [['name',100],['email',254],['message',5000],['size',200],['colors',500],['references',2000],['website',200]]){if(data[field]!==undefined&&(typeof data[field]!=='string'||data[field].length>max))return 'Проверьте длину и формат полей.';}
 if(typeof data.name!=='string'||data.name.trim().length<2)return 'Укажите имя: минимум 2 символа.';
 if(typeof data.email!=='string'||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))return 'Проверьте email.';
 if(typeof data.message!=='string'||data.message.trim().length<10)return 'Опишите задачу: минимум 10 символов.';
 if(data.consent!==true)return 'Для отправки нужно согласие на обработку данных.';
 if(!['contact','order'].includes(data.kind))return 'Неизвестный тип заявки.';
 if(data.service!==''&&!serviceMap.has(data.service))return 'Выберите услугу из списка.';
 if(data.kind==='order'&&!serviceMap.has(data.service))return 'Выберите услугу.';
 if(!Number.isInteger(data.quantity)||data.quantity<1||data.quantity>10000)return 'Количество должно быть целым числом от 1 до 10 000.';
 if(typeof data.urgent!=='boolean')return 'Некорректное значение срочности.';
 if(typeof data.requestId!=='string'||!/^[0-9a-f-]{36}$/i.test(data.requestId))return 'Не удалось определить заявку. Обновите страницу.';
 return null;
}
export function parseAcknowledgement(text){
 let data=JSON.parse(text);if(typeof data==='string')data=JSON.parse(data);
 if(!data||typeof data!=='object'||data.status==='failed'||data.ok===false||data.success===false)return false;
 return data.ok===true||data.success===true||data.status==='success';
}
export async function deliver(payload,{fetchImpl=fetch,env=process.env}={}){
 const mode=env.REQUEST_PROVIDER;
 let url,body,headers;
 if(mode==='webhook'){
  url=env.REQUEST_WEBHOOK_URL;headers={'Content-Type':'application/json',...(env.REQUEST_WEBHOOK_TOKEN?{Authorization:`Bearer ${env.REQUEST_WEBHOOK_TOKEN}`}:{})};body=JSON.stringify(payload);
 }else throw new Error('UNCONFIGURED');
 if(!url||new URL(url).protocol!=='https:')throw new Error('UNCONFIGURED');
 // Optional request notifications never include account passwords or cookies.
 const response=await fetchImpl(url,{method:'POST',headers,body,redirect:'error',signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new Error('UPSTREAM');
 const text=await response.text();
 if(text.length>65536||!parseAcknowledgement(text))throw new Error('UNCONFIRMED');
 return true;
}
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8'};
export function createHandler({root=resolve('dist'),ready=site.legal.ready&&Object.values(site.documents).every(Boolean),send=deliver,expectedOrigin=process.env.PUBLIC_ORIGIN,accountStore}={}){
 const limits=new Map(),requests=new Map();
 const accounts=createAccounts({store:accountStore,expectedOrigin});
 return async(req,res)=>{
  const security={'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Permissions-Policy':'camera=(), microphone=(), geolocation=()','Content-Security-Policy':"default-src 'self'; img-src 'self'; style-src 'self'; font-src 'self'; script-src 'self'; connect-src 'self'; form-action 'self'; base-uri 'self'; frame-ancestors 'none'"};
  for(const [k,v] of Object.entries(security))res.setHeader(k,v);
  function json(code,value){res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));}
  try{
   const url=new URL(req.url,'http://localhost');
   if(await accounts.handle(req,res,url.pathname,json))return;
   if(['/account','/account/','/account/index.html','/sign-in/','/sign-up/'].includes(url.pathname)){
    const user=await accounts.current(req);
    const target=url.pathname.startsWith('/account')?(!user?'/sign-in/':null):(user?'/account/':null);
    if(target){res.writeHead(303,{'Location':target,'Cache-Control':'no-store'});return res.end();}
   }
   if(url.pathname==='/api/requests'){
    if(req.method!=='POST'){res.setHeader('Allow','POST');return json(405,{ok:false,message:'Используйте форму заявки.'});}
    const ownOrigin=expectedOrigin||`http://${req.headers.host}`;
    if((req.headers.origin&&req.headers.origin!==ownOrigin)||req.headers['sec-fetch-site']==='cross-site')return json(403,{ok:false,message:'Отправьте заявку со страницы этого сайта.'});
    if(!(req.headers['content-type']||'').startsWith('application/json'))return json(415,{ok:false,message:'Некорректный формат заявки.'});
    const chunks=[];let bytes=0;for await(const chunk of req){bytes+=chunk.length;if(bytes>24000)return json(413,{ok:false,message:'Заявка слишком большая. Сократите описание или приложите ссылку на материалы.'});chunks.push(chunk);}
    let data;try{data=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{return json(400,{ok:false,message:'Не удалось прочитать заявку.'});}
    const validation=validateRequest(data);if(validation)return json(400,{ok:false,message:validation});
    if(data.website)return json(400,{ok:false,message:'Не удалось проверить заявку.'});
    // Missing launch details never result in a fictitious success or an external transmission.
    if(!ready)return json(503,{ok:false,message:'Не удалось отправить заявку. Повторите попытку позже.'});
    const now=Date.now();for(const [k,v] of limits)if(v.reset<now)limits.delete(k);for(const [k,v] of requests)if(v.expires<now)requests.delete(k);
    const ip=req.socket.remoteAddress||'unknown';const counter=limits.get(ip)||{count:0,reset:now+600000};
    const payload={kind:data.kind,name:data.name.trim(),email:data.email.trim(),service:data.service,serviceName:serviceMap.get(data.service)||'Обсуждение задачи',message:data.message.trim(),quantity:data.quantity,urgent:data.urgent,size:(data.size||'').trim(),colors:(data.colors||'').trim(),references:(data.references||'').trim(),consent:true,requestId:data.requestId};
    const hash=createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    let prior=requests.get(data.requestId);
    if(prior&&prior.hash!==hash)return json(409,{ok:false,message:'Данные заявки изменились. Обновите страницу и отправьте снова.'});
    if(!prior){
      if(counter.count>=15){res.setHeader('Retry-After','600');return json(429,{ok:false,message:'Слишком много попыток. Подождите 10 минут и повторите.'});}
      counter.count++;limits.set(ip,counter);
      // Store the in-flight promise, so double clicks and simultaneous retries produce a single delivery.
      const promise=Promise.resolve().then(()=>send({...payload,timestamp:new Date().toISOString()}));
      prior={promise,hash,expires:now+900000};requests.set(data.requestId,prior);
    }
    try{await prior.promise;return json(200,{ok:true,requestId:data.requestId});}
    catch(error){requests.delete(data.requestId);const unconfigured=error.message==='UNCONFIGURED';return json(unconfigured?503:502,{ok:false,message:unconfigured?'Приём заявок временно недоступен. Данные остались в форме. Попробуйте позже.':'Сервер не подтвердил приём заявки. Данные остались в форме. Повторите попытку позже.'});}
   }
   if(!['GET','HEAD'].includes(req.method))return json(405,{ok:false,message:'Метод не поддерживается.'});
   let pathname;try{pathname=decodeURIComponent(url.pathname);}catch{return json(400,{ok:false,message:'Некорректный адрес.'});}
   let path=resolve(root,'.'+pathname);
   if(path!==root&&!path.startsWith(root+sep))return json(403,{ok:false,message:'Нет доступа.'});
   let code=200;
   try{if((await stat(path)).isDirectory())path=resolve(path,'index.html');await stat(path);}catch{path=resolve(root,'404.html');code=404;}
   const data=await readFile(path);res.writeHead(code,{'Content-Type':mime[extname(path)]||'application/octet-stream','Cache-Control':extname(path)==='.html'?'no-cache':'public, max-age=3600'});res.end(req.method==='HEAD'?undefined:data);
  }catch{if(!res.headersSent)json(500,{ok:false,message:'Ошибка сервера. Повторите попытку позже.'});else res.end();}
 };
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
 const port=Number(process.env.PORT)||4173;
 createServer(createHandler()).listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
}
