// Progressive enhancement: content is always visible, even without this module.
export function setupScrollMotion(root,view){
 const preference=view.matchMedia('(prefers-reduced-motion: reduce)');
 if(!view.IntersectionObserver||!root.querySelector('.hero'))return ()=>{};
 const active=new Map(),seen=new WeakSet(),targets=[];
 const ease='cubic-bezier(.22,.75,.25,1)';
 let disposed=false;
 function finishAll(){for(const animation of active.values())animation.finish();active.clear();}
 function play(element,frames,duration=560,delay=0){
  if(!element?.animate||preference.matches||disposed)return;
  active.get(element)?.cancel();
  const animation=element.animate(frames,{duration,delay,easing:ease,fill:'backwards'});
  active.set(element,animation);
  animation.finished.catch(()=>{}).finally(()=>{if(active.get(element)===animation)active.delete(element);});
 }
 const observer=new view.IntersectionObserver(entries=>{
  const siblingCounts=new Map();
  for(const entry of entries){
   const element=entry.target;
   if(!entry.isIntersecting||entry.intersectionRatio<.12||seen.has(element))continue;
   seen.add(element);observer.unobserve(element);
   // Filtering already owns the grid transition. Keyboard focus must stay still.
   if(preference.matches||root.hidden||element.contains(root.activeElement)||element.closest('.grid-moving')||entry.boundingClientRect.bottom<0)continue;
   const type=element.dataset.scrollMotion;
   const grouped=type==='card'||type==='step'||type==='project';
   const count=grouped?(siblingCounts.get(element.parentElement)||0):0;
   if(grouped)siblingCounts.set(element.parentElement,count+1);
   const delay=Math.min(count,3)*110;
   if(type==='project'){
    play(element,[{opacity:.12,transform:'translateY(28px)',clipPath:'inset(0 0 16% 0)'},{opacity:1,transform:'none',clipPath:'inset(0 0 0% 0)'}],950,delay);
   }else if(type==='step'){
    play(element,[{opacity:.12,transform:'translateY(28px)'},{opacity:1,transform:'none'}],800,delay);
    play(element.querySelector('.step-icon'),[{transform:'scale(.78) rotate(-12deg)'},{transform:'none'}],850,delay);
   }else{
    play(element,[{opacity:.08,transform:type==='card'?'translateY(40px)':'translateY(28px)'},{opacity:1,transform:'none'}],type==='card'?900:800,delay);
   }
  }
 },{threshold:.12,rootMargin:'0px 0px -48px 0px'});
 function add(selector,type){for(const element of root.querySelectorAll(selector)){element.dataset.scrollMotion=type;targets.push(element);}}
 add('.section-heading,.process-title,.coordinator-identity,.coordinator-copy,.faq-layout>h2,.faq-list,.contact-intro,.contact-form-wrap,.footer-top','section');
 add('.service-card,.package','card');
 add('.project','project');
 add('.steps>li','step');
 if(!preference.matches)targets.forEach(element=>observer.observe(element));
 function onPreference(event){
  if(event.matches){finishAll();observer.disconnect();}
  else targets.filter(element=>!seen.has(element)).forEach(element=>observer.observe(element));
 }
 function onFocus(event){
  for(const element of targets)if(element.contains(event.target)){seen.add(element);observer.unobserve(element);}
  for(const [element,animation] of active)if(element.contains(event.target)){animation.finish();active.delete(element);}
 }
 function onVisibility(){if(root.hidden)finishAll();}
 preference.addEventListener('change',onPreference);
 root.addEventListener('focusin',onFocus);
 root.addEventListener('visibilitychange',onVisibility);
 if(!preference.matches&&!view.location.hash&&view.scrollY<24&&!root.hidden){
  const copy=root.querySelector('.hero-copy');
  [...copy.children].forEach((element,index)=>play(element,[{opacity:.08,transform:'translateY(28px)'},{opacity:1,transform:'none'}],900,Math.min(index,3)*120));
  const image=root.querySelector('.hero-backdrop img');
  image?.decode().catch(()=>{}).then(()=>{
   if(view.scrollY<24&&!root.hidden)play(image,[{transform:'scale(1.075)'},{transform:'none'}],1500);
  });
 }
 return ()=>{disposed=true;finishAll();observer.disconnect();preference.removeEventListener('change',onPreference);root.removeEventListener('focusin',onFocus);root.removeEventListener('visibilitychange',onVisibility);};
}
if(typeof document!=='undefined')setupScrollMotion(document,window);
