import {test} from 'node:test';
import assert from 'node:assert/strict';
import {setupScrollMotion} from '../public/scroll-motion.js';
function fixture(reduced=false){
 const group={},listeners={},preference={matches:reduced,addEventListener(_,fn){this.change=fn;},removeEventListener(){}};
 const cards=Array.from({length:4},()=>({dataset:{},parentElement:group,animations:[],contains(target){return target===this;},closest(){return this.filtering?{}:null;},animate(frames,options){let done;const animation={frames,options,finished:new Promise(resolve=>{done=resolve;}),finish(){this.finishedNow=true;done();},cancel(){done();}};this.animations.push(animation);return animation;}}));
 let observer;
 class Observer{constructor(callback){this.callback=callback;this.observed=new Set();observer=this;}observe(el){this.observed.add(el);}unobserve(el){this.observed.delete(el);}disconnect(){this.observed.clear();}}
 const root={hidden:false,activeElement:null,querySelector:s=>s==='.hero'?{}:null,querySelectorAll:s=>s==='.service-card,.package'?cards:[],addEventListener:(type,fn)=>{listeners[type]=fn;},removeEventListener:type=>{delete listeners[type];}};
 const dispose=setupScrollMotion(root,{matchMedia:()=>preference,IntersectionObserver:Observer,location:{hash:'#services'},scrollY:100});
 const enter=(els=cards)=>observer.callback(els.map(target=>({target,isIntersecting:true,intersectionRatio:.2,boundingClientRect:{bottom:100}})));
 return {cards,observer,preference,root,listeners,enter,dispose};
}
test('scroll entry runs once with bounded stagger and no persistent hidden state',()=>{
 const f=fixture();f.enter();f.enter();
 assert.deepEqual(f.cards.map(c=>c.animations.length),[1,1,1,1]);
 assert.deepEqual(f.cards.map(c=>c.animations[0].options.delay),[0,110,220,330]);
 assert.equal(f.observer.observed.size,0);
 assert(f.cards.every(c=>!('style' in c)));
 f.dispose();
});
test('reduced motion starts without entries and immediately settles active animations',()=>{
 const f=fixture(true);assert.equal(f.observer.observed.size,0);
 f.preference.matches=false;f.preference.change({matches:false});f.enter();
 f.preference.matches=true;f.preference.change({matches:true});
 assert(f.cards.every(c=>c.animations[0].finishedNow));assert.equal(f.observer.observed.size,0);
 f.dispose();
});
test('keyboard focus cancels movement and filtering does not receive a second entrance',()=>{
 const f=fixture();f.cards[1].filtering=true;f.enter([f.cards[0],f.cards[1]]);
 f.listeners.focusin({target:f.cards[0]});
 assert(f.cards[0].animations[0].finishedNow);assert.equal(f.cards[1].animations.length,0);
 f.listeners.focusin({target:f.cards[2]});f.enter([f.cards[2]]);
 assert.equal(f.cards[2].animations.length,0);
 f.dispose();
});
test('hidden pages settle running motion and unsupported observers leave content alone',()=>{
 const f=fixture();f.enter();f.root.hidden=true;f.listeners.visibilitychange();
 assert(f.cards.every(c=>c.animations[0].finishedNow));f.dispose();
 assert.doesNotThrow(()=>setupScrollMotion({querySelector:()=>({})},{matchMedia:()=>({matches:false})})());
});

test('a sliver at the viewport edge does not consume the entrance',()=>{
 const f=fixture();
 f.observer.callback([{target:f.cards[0],isIntersecting:true,intersectionRatio:.01,boundingClientRect:{bottom:100}}]);
 assert.equal(f.cards[0].animations.length,0);assert(f.observer.observed.has(f.cards[0]));
 f.enter([f.cards[0]]);assert.equal(f.cards[0].animations.length,1);f.dispose();
});
