import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const script=await readFile(new URL('../public/app.js',import.meta.url),'utf8');
function runtime(reduced=false){
 const preference={matches:reduced,addEventListener(_event,listener){this.change=listener;}};
 const mobile={querySelectorAll:()=>[]};
 const document={querySelector:selector=>selector==='#mobile-nav'?mobile:null,querySelectorAll:()=>[],addEventListener(){}};
 const context=vm.createContext({document,window:{matchMedia:query=>query.includes('prefers-reduced-motion')?preference:{addEventListener(){}}}});
 vm.runInContext(script,context);
 return {context,preference};
}
function element(){
 const animations=[];
 return {
  height:400,animations,
  getBoundingClientRect(){return {height:this.height};},
  animate(frames,options){
   let resolve,reject;
   const finished=new Promise((yes,no)=>{resolve=yes;reject=no;});
   const animation={frames,options,finished,finish:resolve,cancel:()=>reject(new Error('Interrupted'))};
   animations.push(animation);
   return animation;
  }
 };
}
test('rapid replacement cancels stale motion and resolves the latest state',async()=>{
 const {context}=runtime(),target=element();
 const first=context.animateUI(target,[{opacity:0},{opacity:1}]);
 const second=context.animateUI(target,[{opacity:1},{opacity:0}]);
 target.animations[1].finish();
 assert.equal(await first,false);
 assert.equal(await second,true);
 // A third interaction must also work after the cancelled promise has settled.
 const third=context.animateUI(target,[{opacity:0},{opacity:1}]);
 target.animations[2].finish();
 assert.equal(await third,true);
});
test('reduced motion applies content immediately and finishes already running motion',async()=>{
 const {context,preference}=runtime(true),target=element();
 let updates=0;
 await context.swapContent(target,()=>{updates++;target.height=200;});
 assert.equal(updates,1);
 assert.equal(target.animations.length,0);
 preference.matches=false;
 const pending=context.animateUI(target,[{opacity:0},{opacity:1}]);
 preference.matches=true;preference.change({matches:true});
 assert.equal(await pending,true);
 assert.equal(target.animations.length,1);
});
test('content changes preserve responsive natural height after an interrupted swap',async()=>{
 const {context}=runtime(),target=element();
 const first=context.swapContent(target,()=>{target.height=200;});
 const second=context.swapContent(target,()=>{target.height=500;});
 assert.equal(target.height,500);
 assert.equal(target.animations[1].frames[0].height,'200px');
 assert.equal(target.animations[1].frames[1].height,'500px');
 target.animations[1].finish();
 assert.equal(await first,false);
 assert.equal(await second,true);
 assert.equal(target.height,500);
});
