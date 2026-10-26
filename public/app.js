const $ = (s,root=document) => root.querySelector(s);
const $$ = (s,root=document) => [...root.querySelectorAll(s)];
const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
const motionEase='cubic-bezier(.16,1,.3,1)';
const motionByElement=new WeakMap(),runningMotion=new Set();
function stopMotion(element){motionByElement.get(element)?.cancel();}
function animateUI(element,keyframes,duration=280){
 stopMotion(element);
 if(motionPreference.matches||!element.animate)return Promise.resolve(true);
 const animation=element.animate(keyframes,{duration,easing:motionEase});
 motionByElement.set(element,animation);runningMotion.add(animation);
 return animation.finished.then(()=>true,()=>false).finally(()=>{
  runningMotion.delete(animation);
  if(motionByElement.get(element)===animation)motionByElement.delete(element);
 });
}
motionPreference.addEventListener('change',e=>{if(e.matches)runningMotion.forEach(animation=>animation.finish());});
// Change content synchronously; animate the new layout without delaying input.
function swapContent(container,update){
 const height=container.getBoundingClientRect().height;
 stopMotion(container);update();
 const nextHeight=container.getBoundingClientRect().height;
 return animateUI(container,[{height:`${height}px`,opacity:.25},{height:`${nextHeight}px`,opacity:1}]);
}
const disclosureTargets=new WeakMap();
async function setDisclosure(details,open){
 const start=details.getBoundingClientRect().height;
 stopMotion(details);
 disclosureTargets.set(details,open);
 details.open=true;
 const summary=$('summary',details),style=getComputedStyle(details);
 const end=open?details.getBoundingClientRect().height:summary.getBoundingClientRect().height+parseFloat(style.borderTopWidth)+parseFloat(style.borderBottomWidth);
 const body=[...details.children].filter(el=>el!==summary);
 if(!open&&details.contains(document.activeElement)&&document.activeElement!==summary)summary.focus({preventScroll:true});
 body.forEach(el=>{el.inert=!open;});
 details.classList.add('disclosure-moving');
 details.classList.toggle('is-collapsing',!open);
 const complete=await animateUI(details,[{height:`${start}px`},{height:`${end}px`}],open?300:200);
 if(!complete||disclosureTargets.get(details)!==open)return;
 details.open=open;
 body.forEach(el=>{el.inert=false;});
 details.classList.remove('disclosure-moving','is-collapsing');
 disclosureTargets.delete(details);
}
$$('details').forEach(details=>{
 $('summary',details)?.addEventListener('click',event=>{
  event.preventDefault();
  setDisclosure(details,!(disclosureTargets.get(details)??details.open));
 });
});
const menu=$('.menu-toggle'),mobile=$('#mobile-nav');
async function setMenu(open){
 if(!menu||!mobile)return;
 const start=mobile.hidden?0:mobile.getBoundingClientRect().height;
 const opacity=mobile.hidden?0:getComputedStyle(mobile).opacity;
 const before=getComputedStyle(mobile);
 const paddingTop=mobile.hidden?'0px':before.paddingTop,paddingBottom=mobile.hidden?'0px':before.paddingBottom,borderTopWidth=mobile.hidden?'0px':before.borderTopWidth;
 stopMotion(mobile);
 menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');
 mobile.hidden=false;mobile.inert=!open;
 const height=mobile.getBoundingClientRect().height;
 const after=getComputedStyle(mobile);
 const complete=await animateUI(mobile,[
  {height:`${start}px`,opacity,paddingTop,paddingBottom,borderTopWidth},
  {height:`${open?height:0}px`,opacity:open?1:0,paddingTop:open?after.paddingTop:'0px',paddingBottom:open?after.paddingBottom:'0px',borderTopWidth:open?after.borderTopWidth:'0px'}
 ],open?280:180);
 if(complete&&menu.getAttribute('aria-expanded')===String(open))mobile.hidden=!open;
}
function closeMenu(){if(menu?.getAttribute('aria-expanded')==='true')return setMenu(false);return Promise.resolve();}
menu?.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
$$('a',mobile).forEach(a=>a.addEventListener('click',async event=>{
 if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button!==0)return;
 const url=new URL(a.href,location.href);
 const target=url.pathname===location.pathname&&url.hash?document.getElementById(decodeURIComponent(url.hash.slice(1))):null;
 if(!target){closeMenu();return;}
 event.preventDefault();
 // Measure the anchor only after the header has finished collapsing.
 await closeMenu();
 if(menu.getAttribute('aria-expanded')==='true')return;
 if(location.hash!==url.hash)history.pushState(null,'',url.hash);
 const originalTabIndex=target.getAttribute('tabindex');
 target.setAttribute('tabindex','-1');target.focus({preventScroll:true});
 target.addEventListener('blur',()=>{if(originalTabIndex===null)target.removeAttribute('tabindex');else target.setAttribute('tabindex',originalTabIndex);},{once:true});
 target.scrollIntoView({behavior:motionPreference.matches?'instant':'smooth',block:'start'});
}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
window.matchMedia('(min-width:901px)').addEventListener('change',e=>{if(e.matches)closeMenu();});

let contentPromise;
const content = () => contentPromise ||= fetch('/content.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('content');return r.json();}).catch(e=>{contentPromise=null;throw e;});
const order=$('#order-dialog'),gallery=$('#project-dialog');
let projectIndex=0,activeFilter='all';
const dialogOrigins=new WeakMap(),dialogClosures=new WeakMap();
function openDialog(dialog,origin=document.activeElement){
 closeMenu();dialogOrigins.set(dialog,origin);
 dialog.classList.remove('is-closing');dialog.showModal();dialog.scrollTop=0;
 animateUI(dialog,[{opacity:0,transform:'translateY(14px) scale(.985)'},{opacity:1,transform:'none'}],300);
}
function closeDialog(dialog){
 if(!dialog.open)return Promise.resolve();
 if(dialog===gallery)$('#project-video')?.pause();
 if(dialogClosures.has(dialog))return dialogClosures.get(dialog);
 const style=getComputedStyle(dialog);
 dialog.classList.add('is-closing');
 const closing=animateUI(dialog,[{opacity:style.opacity,transform:style.transform},{opacity:0,transform:'translateY(8px) scale(.99)'}],180).then(()=>{
  dialog.close();dialog.classList.remove('is-closing');dialogClosures.delete(dialog);
 });
 dialogClosures.set(dialog,closing);
 return closing;
}
$$('dialog').forEach(dialog=>{
  $('[data-close]',dialog)?.addEventListener('click',()=>closeDialog(dialog));
  dialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog(dialog);});
  dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)closeDialog(dialog);}});
  dialog.addEventListener('close',()=>{if(!$('dialog[open]'))dialogOrigins.get(dialog)?.focus({preventScroll:true});});
});
async function openOrder(value='other',direction){
 if(!order)return;
 const origin=gallery?.open?dialogOrigins.get(gallery):document.activeElement;
 if(gallery?.open)await closeDialog(gallery);
 const form=$('form',order),select=$('[name=service]',form);
 const message=$('[name=message]',form);
 // Replace only our untouched suggestion; preserve a brief written by the visitor.
 if(form.dataset.suggestedBrief===message.value)message.value='';
 delete form.dataset.suggestedBrief;
 select.value=[...select.options].some(o=>o.value===value)?value:'other';
 if(direction){const matching=[...select.options].find(o=>o.textContent===direction);const aliases={'Логотипы':'logo-basic','Обложки релизов':'cover'};select.value=matching?.value||aliases[direction]||'other';if(!message.value){message.value=`Нужна услуга: ${direction}. `;form.dataset.suggestedBrief=message.value;}}
 clearField(select);openDialog(order,origin);
}
$$('[data-order]').forEach(b=>b.addEventListener('click',()=>openOrder(b.dataset.order)));
$$('[data-direction]').forEach(b=>b.addEventListener('click',()=>openOrder('other',b.dataset.direction)));
let projectRequest=0;
function setComparison(value){
 const input=$('#compare-range'),compare=$('#project-compare');
 if(!input||!compare)return;
 input.value=value;compare.style.setProperty('--reveal',`${value}%`);
 input.setAttribute('aria-valuetext',`Исходное фото: ${value}%, новый фон: ${100-value}%`);
}
$('#compare-range')?.addEventListener('input',e=>setComparison(Number(e.target.value)));
document.addEventListener('visibilitychange',()=>{if(document.hidden)$('#project-video')?.pause();});
async function showProject(index){
 const request=++projectRequest;
 const data=await content();const ps=data.projects;
 if(request!==projectRequest)return false;
 projectIndex=(index+ps.length)%ps.length;const p=ps[projectIndex];
 const source=`/assets/${p.image}-1920.webp`,preload=new Image();
 preload.src=source;await preload.decode();
 if(request!==projectRequest)return false;
 const img=$('#project-full'),info=$('.project-dialog-info>div',gallery),video=$('#project-video'),compare=$('#project-compare'),frame=$('.project-frame',gallery);
 video.pause();
 if(gallery.open){
  await Promise.all([animateUI(img,[{opacity:getComputedStyle(img).opacity},{opacity:0}],120),animateUI(info,[{opacity:1},{opacity:0}],120)]);
  if(request!==projectRequest)return false;
 }
 $('#project-title').textContent=p.title;$('#project-description').textContent=p.description;
 img.src=source;img.alt=p.alt;
 img.hidden=Boolean(p.video||p.before);video.hidden=!p.video;compare.hidden=!p.before;
 frame.classList.toggle('is-video',Boolean(p.video));
 video.removeAttribute('src');video.replaceChildren();video.load();
 if(p.video){
  video.poster=p.poster||source;video.src=p.video;video.setAttribute('aria-label',p.title);
  if(p.captions){const track=document.createElement('track');track.kind='captions';track.srclang='ru';track.label='Русские субтитры';track.src=p.captions;video.append(track);}
 }
 if(p.before){$('#compare-before').src=`/assets/${p.before}-1920.webp`;$('#compare-after').src=source;setComparison(50);}
 const transcript=$('#project-transcript');transcript.hidden=!p.transcript;transcript.textContent=p.transcript?`Озвучка: «${p.transcript}»`:'';
 $('#project-task').textContent=p.story.task;
 $('#project-items').replaceChildren(...p.story.items.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
 $('#project-count').textContent=`${projectIndex+1} / ${ps.length}`;
 $('#project-order').dataset.order=p.service;
 $('#project-order').firstChild.textContent=p.video?'Нужен похожий ролик ':p.before?'Нужно обработать фото ':'Нужен похожий дизайн ';
 if(gallery.open){
  animateUI(img,[{opacity:0},{opacity:1}],260);
  animateUI(info,[{opacity:0,transform:'translateY(5px)'},{opacity:1,transform:'none'}],260);
 }
 return true;
}
$$('[data-project]').forEach(b=>b.addEventListener('click',async()=>{try{const data=await content();if(await showProject(data.projects.findIndex(p=>p.id===b.dataset.project)))openDialog(gallery,b);}catch{b.setAttribute('aria-label','Не удалось загрузить просмотр. Попробуйте ещё раз.');}}));
$('#project-order')?.addEventListener('click',e=>openOrder(e.currentTarget.dataset.order));
function nextProject(direction){showProject(projectIndex+direction).catch(()=>{$('#project-description').textContent='Не удалось загрузить изображение. Попробуйте переключить ещё раз.';});}
$('[data-prev]')?.addEventListener('click',()=>nextProject(-1));
$('[data-next]')?.addEventListener('click',()=>nextProject(1));
gallery?.addEventListener('keydown',e=>{if(e.target.closest('video,input'))return;if(e.key==='ArrowRight'){e.preventDefault();nextProject(1);}if(e.key==='ArrowLeft'){e.preventDefault();nextProject(-1);}});
const filterRequests=new WeakMap();
async function filterGrid(grid,update){
 const request={};filterRequests.set(grid,request);
 const height=grid.getBoundingClientRect().height,opacity=getComputedStyle(grid).opacity;
 grid.classList.add('grid-moving');
 await animateUI(grid,[{opacity,height:`${height}px`},{opacity:0,height:`${height}px`}],110);
 if(filterRequests.get(grid)!==request)return;
 update();
 const nextHeight=grid.getBoundingClientRect().height;
 await animateUI(grid,[{opacity:0,height:`${height}px`},{opacity:1,height:`${nextHeight}px`}],280);
 if(filterRequests.get(grid)===request){grid.classList.remove('grid-moving');filterRequests.delete(grid);}
}
$$('[data-filter]').forEach(b=>b.addEventListener('click',()=>{
 if(activeFilter===b.dataset.filter)return;
 activeFilter=b.dataset.filter;
 $$('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
 filterGrid($('.project-grid'),()=>{
  let visible=0;$$('.project').forEach(p=>{p.hidden=activeFilter!=='all'&&p.dataset.category!==activeFilter;if(!p.hidden)visible++;});
  $('.project-grid').classList.toggle('is-filtered',activeFilter!=='all');
  $('#filter-status').textContent=`Показано примеров: ${visible}`;
 });
}));

const serviceGrid=$('.service-grid'),serviceMore=$('[data-service-more]');
if(serviceGrid&&serviceMore){
 const cards=$$('.service-card',serviceGrid),filters=$$('[data-service-filter]');
 const compact=window.matchMedia('(max-width:600px)');
 let group='all',expanded=false;
 function renderServices(animate=true){
  const update=()=>{
   const limited=compact.matches&&group==='all'&&!expanded;
   let visible=0;
   cards.forEach((card,index)=>{
    card.hidden=(group!=='all'&&card.dataset.serviceGroup!==group)||(limited&&index>=4);
    if(!card.hidden)visible++;
   });
   serviceMore.hidden=!limited||cards.length<=4;
   serviceMore.textContent=`Показать все ${cards.length} услуг`;
   serviceMore.setAttribute('aria-expanded',String(expanded));
   $('#service-filter-status').textContent=limited?`Показано ${visible} из ${cards.length} услуг. Остальные доступны по кнопке «Показать все» или в категориях.`:`Показано услуг: ${visible}`;
  };
  if(animate)return filterGrid(serviceGrid,update);
  stopMotion(serviceGrid);filterRequests.delete(serviceGrid);
  serviceGrid.classList.remove('grid-moving');
  update();return Promise.resolve();
 }
 filters.forEach(button=>button.addEventListener('click',()=>{
  if(group===button.dataset.serviceFilter)return;
  group=button.dataset.serviceFilter;
  filters.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  renderServices();
 }));
 serviceMore.addEventListener('click',async()=>{
  const firstNew=cards.find(card=>card.hidden),restoreFocus=document.activeElement===serviceMore;
  expanded=true;
  await renderServices();
  // The expansion button disappears; keep keyboard focus in the newly revealed list.
  if(restoreFocus&&firstNew&&!firstNew.hidden){
   firstNew.setAttribute('tabindex','-1');firstNew.focus({preventScroll:true});
   firstNew.addEventListener('blur',()=>firstNew.removeAttribute('tabindex'),{once:true});
  }
 });
 compact.addEventListener('change',()=>renderServices(false));
 renderServices(false);
}

function clearField(input){input.removeAttribute('aria-invalid');if(input.name!=='consent')input.removeAttribute('aria-describedby');const error=input.closest('.field')?.querySelector('.field-error');if(error)error.textContent='';}
function errorField(input,message){input.setAttribute('aria-invalid','true');const error=input.closest('.field')?.querySelector('.field-error');if(error){error.textContent=message;input.setAttribute('aria-describedby',error.id);}}
$$('.request-form').forEach(form=>{
 let busy=false,requestId=null,previousPayload=null;
 $$('input,select,textarea',form).forEach(input=>input.addEventListener('input',()=>{clearField(input);if(input.name==='consent')$('.consent-error',form).textContent='';}));
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(busy)return;
  const fields=['name','email','message',...(form.dataset.kind==='order'?['service']:[])];let firstInvalid=null;
  for(const name of fields){const input=form.elements[name];clearField(input);let error='';const value=input.value.trim();
   if(!value)error=name==='service'?'Выберите услугу.':'Заполните это поле.';
   else if(name==='name'&&value.length<2)error='Укажите имя: минимум 2 символа.';
   else if(name==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))error='Проверьте адрес: например, name@company.ru.';
   else if(name==='message'&&value.length<10)error='Добавьте немного деталей: минимум 10 символов.';
   if(error){errorField(input,error);firstInvalid ||= input;}
  }
  const quantity=form.elements.quantity;
  if(!quantity.validity.valid){errorField(quantity,'Укажите целое количество от 1 до 10 000.');firstInvalid ||= quantity;}
  const consent=form.elements.consent;
  if(!consent.checked){$('.consent-error',form).textContent='Для отправки нужно согласие на обработку данных.';consent.setAttribute('aria-invalid','true');firstInvalid ||= consent;}
  const status=$('.form-status',form);status.classList.remove('success');status.textContent='';
  if(firstInvalid){const disclosure=firstInvalid.closest('details');if(disclosure)await setDisclosure(disclosure,true);firstInvalid.focus();return;}
  const data=Object.fromEntries(new FormData(form));data.consent=consent.checked;data.urgent=form.elements.urgent.checked;data.quantity=Number(data.quantity);data.kind=form.dataset.kind;
  data.serviceName=form.elements.service.selectedOptions[0]?.textContent||'';
  const payload=JSON.stringify(data);if(payload!==previousPayload){requestId=crypto.randomUUID();previousPayload=payload;}
  data.requestId=requestId;
  busy=true;const button=$('.submit',form),label=$('span',button),original=label.textContent;button.disabled=true;form.setAttribute('aria-busy','true');label.textContent='Отправляем…';
  try{
   const response=await fetch('/api/requests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(20000)});
   let result;try{result=await response.json();}catch{throw Error('Сервер вернул непонятный ответ. Данные остались в форме; попробуйте позже.');}
   if(!response.ok||result.ok!==true)throw Error(result.message||'Не удалось подтвердить отправку. Данные остались в форме; попробуйте позже.');
   status.classList.add('success');status.textContent='Заявка принята. Ответ придёт на указанный email.';form.reset();requestId=null;previousPayload=null;
  }catch(error){status.textContent=error.name==='TimeoutError'||error.name==='AbortError'?'Ответ сервера не получен. Отправка не подтверждена. Повторите попытку позже — данные остались в форме.':error instanceof TypeError?'Нет связи с сервером. Проверьте подключение и повторите — данные остались в форме.':error.message;}
  finally{busy=false;button.disabled=false;form.removeAttribute('aria-busy');label.textContent=original;}
 });
});
