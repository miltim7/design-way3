// Silent previews only run while their card is in view. Full players stay user-started.
(() => {
 const videos=[...document.querySelectorAll('[data-video-preview]')];
 if(!videos.length)return;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const states=new Map(videos.map(video=>[video,{visible:false,paused:false,manual:false}]));
 const buttons=new Map(videos.map(video=>[video,document.querySelector(`[data-preview-toggle="${video.id}"]`)]));
 function update(video){
  const button=buttons.get(video);if(!button)return;
  const playing=!video.paused;
  button.dataset.playing=String(playing);
  button.setAttribute('aria-label',`${playing?'Приостановить':'Воспроизвести'} превью: ${video.dataset.title}`);
 }
 function pause(video){if(!video.paused)video.pause();update(video);}
 function refresh(video){
  const state=states.get(video);
  if(!state.visible||state.paused||document.hidden||document.querySelector('dialog[open]')||(reduced.matches&&!state.manual)){pause(video);return;}
  if(!video.getAttribute('src')){video.src=video.dataset.src;video.muted=true;video.defaultMuted=true;video.load();}
  if(!video.paused){update(video);return;}
  video.play().then(()=>{
   // A play promise can resolve after the card left the screen or a dialog opened.
   if(!state.visible||state.paused||document.hidden||document.querySelector('dialog[open]')||(reduced.matches&&!state.manual))pause(video);
   else update(video);
  }).catch(()=>update(video));
 }
 function refreshAll(){videos.forEach(refresh);}
 const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{
  entries.forEach(entry=>{states.get(entry.target).visible=entry.isIntersecting&&entry.intersectionRatio>=.25;refresh(entry.target);});
 },{threshold:[0,.25]}):null;
 videos.forEach(video=>{
  video.muted=true;video.defaultMuted=true;
  observer?.observe(video);
  video.addEventListener('play',()=>update(video));video.addEventListener('pause',()=>update(video));
  buttons.get(video)?.addEventListener('click',()=>{
   const state=states.get(video);
   if(!video.paused){state.paused=true;pause(video);}
   else{state.paused=false;state.manual=true;state.visible=true;refresh(video);}
  });
  update(video);
 });
 document.addEventListener('visibilitychange',refreshAll);
 reduced.addEventListener('change',()=>{if(reduced.matches)states.forEach(state=>state.manual=false);refreshAll();});
 const dialogs=new MutationObserver(refreshAll);
 document.querySelectorAll('dialog').forEach(dialog=>dialogs.observe(dialog,{attributes:true,attributeFilter:['open']}));
})();
