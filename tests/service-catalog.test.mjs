import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import {services} from '../src/content.mjs';

const script=await readFile(new URL('../public/app.js',import.meta.url),'utf8');
function catalog(mobile=true){
 const groups=services.map(s=>s.group);
 const element=dataset=>({
  dataset,hidden:false,attributes:{},listeners:{},
  getAttribute(name){return this.attributes[name];},
  setAttribute(name,value){this.attributes[name]=value;},
  removeAttribute(name){delete this.attributes[name];},
  addEventListener(name,fn){this.listeners[name]=fn;},
  focus(){document.activeElement=this;}
 });
 const cards=groups.map(group=>element({serviceGroup:group}));
 const filters=['all',...new Set(groups)].map(group=>element({serviceFilter:group}));
 const more=element({}),status={},grid={querySelectorAll:()=>cards,classList:{remove(){}}};
 const preference={matches:mobile,addEventListener(_name,fn){this.change=fn;}};
 const document={
  activeElement:null,addEventListener(){},
  querySelector(selector){return ({'.service-grid':grid,'[data-service-more]':more,'#service-filter-status':status,'#mobile-nav':{querySelectorAll:()=>[]}})[selector]||null;},
  querySelectorAll(selector){return selector==='[data-service-filter]'?filters:[];}
 };
 const context=vm.createContext({document,window:{matchMedia:q=>q==='(max-width:600px)'?preference:{matches:true,addEventListener(){}}}});
 vm.runInContext(script,context);
 // Motion is covered independently; exercise catalogue events against immediate completion.
 context.filterGrid=async(_grid,update)=>update();
 return {
  cards,more,status,document,
  visible:()=>cards.filter(card=>!card.hidden),
  choose:async group=>{await filters.find(f=>f.dataset.serviceFilter===group).listeners.click();},
  resize:async mobile=>{preference.matches=mobile;await preference.change();}
 };
}
test('phone starts with four services; every filtered category remains complete',async()=>{
 const c=catalog();
 assert.equal(c.visible().length,4);
 assert.equal(c.more.hidden,false);
 await c.choose('print');
 assert.equal(c.visible().length,5);
 assert(c.visible().every(card=>card.dataset.serviceGroup==='print'));
 assert.equal(c.more.hidden,true);
 await c.choose('motion');
 assert.equal(c.visible().length,4);
 await c.choose('marketplace');
 assert.equal(c.visible().length,2);
 assert(c.visible().every(card=>card.dataset.serviceGroup==='marketplace'));
 await c.choose('all');
 assert.equal(c.visible().length,4);
 assert.equal(c.more.hidden,false);
});
test('show all reveals every service and transfers focus off the disappearing control',async()=>{
 const c=catalog();
 c.document.activeElement=c.more;
 await c.more.listeners.click();
 assert.equal(c.visible().length,services.length);
 assert.equal(c.more.hidden,true);
 assert.equal(c.document.activeElement,c.cards[4]);
 await c.choose('identity');
 await c.choose('all');
 assert.equal(c.visible().length,services.length);
 await c.resize(false);
 await c.resize(true);
 assert.equal(c.visible().length,services.length);
});
test('desktop shows all services; resizing preserves the selected category',async()=>{
 const c=catalog(false);
 assert.equal(c.visible().length,services.length);
 assert.equal(c.more.hidden,true);
 await c.resize(true);
 assert.equal(c.visible().length,4);
 await c.choose('print');
 await c.resize(false);
 assert.equal(c.visible().length,5);
 await c.choose('all');
 assert.equal(c.visible().length,services.length);
});
