import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const script=await readFile(new URL('../public/video-previews.js',import.meta.url),'utf8');
function setup(reduce=false){
 const events={},button={dataset:{},attrs:{},listeners:{},setAttribute(k,v){this.attrs[k]=v;},addEventListener(k,v){this.listeners[k]=v;}};
 const video={id:'preview',dataset:{src:'/clip.mp4',title:'Ролик'},attrs:{},paused:true,plays:0,pauses:0,getAttribute(k){return this.attrs[k]||null;},set src(v){this.attrs.src=v;},load(){},addEventListener(){},play(){this.plays++;this.paused=false;return this.pending?new Promise(resolve=>this.resolve=resolve):Promise.resolve();},pause(){this.paused=true;this.pauses++;}};
 const pref={matches:reduce,addEventListener(_k,v){this.change=v;}};
 let io,mutation;
 const document={hidden:false,modal:false,querySelectorAll(s){return s==='[data-video-preview]'?[video]:s==='dialog'?[{}]:[];},querySelector(s){return s==='dialog[open]'?this.modal?{}:null:button;},addEventListener(k,v){events[k]=v;}};
 class Observer{constructor(cb){io=cb;}observe(){}}
 class Mutation{constructor(cb){mutation=cb;}observe(){}}
 vm.runInNewContext(script,{document,window:{matchMedia:()=>pref,IntersectionObserver:Observer},IntersectionObserver:Observer,MutationObserver:Mutation});
 return {video,button,pref,document,visible(on){io([{target:video,isIntersecting:on,intersectionRatio:on?1:0}]);},modal(on){document.modal=on;mutation();},hidden(on){document.hidden=on;events.visibilitychange();},toggle(){button.listeners.click();}};
}
const settle=()=>new Promise(resolve=>setImmediate(resolve));
test('preview loads on screen, stays silent, and stops offscreen or behind a modal',async()=>{
 const c=setup();assert.equal(c.video.attrs.src,undefined);assert.equal(c.video.plays,0);
 c.visible(true);await settle();assert.equal(c.video.attrs.src,'/clip.mp4');assert.equal(c.video.muted,true);assert.equal(c.button.dataset.playing,'true');
 c.visible(false);assert.equal(c.video.paused,true);
 c.visible(true);await settle();c.modal(true);assert.equal(c.video.paused,true);c.modal(false);await settle();assert.equal(c.video.paused,false);
 c.hidden(true);assert.equal(c.video.paused,true);
});
test('manual pause survives viewport changes; resume is explicit',async()=>{
 const c=setup();c.visible(true);await settle();c.toggle();assert.equal(c.video.paused,true);
 c.visible(false);c.visible(true);await settle();assert.equal(c.video.paused,true);
 c.toggle();await settle();assert.equal(c.video.paused,false);
});
test('reduced motion uses the poster until requested and stops when preference changes',async()=>{
 const c=setup(true);c.visible(true);await settle();assert.equal(c.video.plays,0);
 c.toggle();await settle();assert.equal(c.video.paused,false);
 c.pref.change();assert.equal(c.video.paused,true);
});
test('late play completion cannot restart a preview that left the viewport',async()=>{
 const c=setup();c.video.pending=true;c.visible(true);c.visible(false);c.video.resolve();await settle();assert.equal(c.video.paused,true);assert.equal(c.button.dataset.playing,'false');
});
