import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {projects} from '../src/content.mjs';
const source=await readFile(new URL('../public/app.js',import.meta.url),'utf8');
const part=(start,end)=>source.slice(source.indexOf(start),source.indexOf(end,source.indexOf(start)));
const element=dataset=>({dataset,hidden:false,attributes:{},listeners:{},setAttribute(key,value){this.attributes[key]=value;},removeAttribute(key){delete this.attributes[key];},addEventListener(type,listener){this.listeners[type]=listener;}});

test('designer and demonstration selections stay separate; changing selection resets categories',()=>{
 const cards=projects.map(project=>element({origin:['provided','client'].includes(project.kind)?'designer':'demo',category:project.category}));
 const categories=['all','identity','print','digital','marketplace','motion'].map(filter=>element({filter}));
 const origins=['designer','demo'].map(originFilter=>element({originFilter}));
 const grid={classList:{toggle(){}}},status={textContent:''};
 const context=vm.createContext({activeOrigin:'designer',activeFilter:'all',
  $:selector=>selector==='.project-grid'?grid:status,
  $$:selector=>selector==='.project'?cards:selector==='[data-filter]'?categories:origins,
  filterGrid(_grid,update){update();return Promise.resolve();}});
 vm.runInContext(part('function renderProjects(','const serviceGrid='),context);
 assert.equal(cards.filter(card=>!card.hidden).length,10);
 assert(cards.filter(card=>!card.hidden).every(card=>card.dataset.origin==='designer'));
 categories.find(button=>button.dataset.filter==='print').listeners.click();
 assert.equal(cards.filter(card=>!card.hidden).length,4);
 origins[1].listeners.click();
 assert.equal(cards.filter(card=>!card.hidden).length,19);
 assert.equal(context.activeFilter,'all');
 assert(cards.filter(card=>!card.hidden).every(card=>card.dataset.origin==='demo'));
 categories.find(button=>button.dataset.filter==='motion').listeners.click();
 assert.equal(cards.filter(card=>!card.hidden).length,2);
 origins[0].listeners.click();
 assert.equal(cards.filter(card=>!card.hidden).length,10);
 assert(categories.find(button=>button.dataset.filter==='motion').hidden);
 assert(categories.find(button=>button.dataset.filter==='marketplace').hidden);
});

test('next project follows the visible selection and wraps without crossing into demonstrations',async()=>{
 let visible=projects.filter(project=>project.kind==='provided'&&project.category==='print').map(project=>({dataset:{project:project.id}}));
 const calls=[];
 const context=vm.createContext({projectIndex:2,$$:()=>visible,$:()=>({}),content:async()=>({projects}),showProject:async index=>{calls.push(index);context.projectIndex=index;}});
 vm.runInContext(part('function projectScope(','function configureProjectSheets(')+part('async function nextProject(',"$('[data-prev]')"),context);
 await context.nextProject(1);assert.equal(projects[calls.at(-1)].id,'retro-style-editorial');
 await context.nextProject(1);assert.equal(projects[calls.at(-1)].id,'education-editorial');
 await context.nextProject(1);assert.equal(projects[calls.at(-1)].id,'education-ai-magazine');
 visible=projects.filter(project=>project.kind==='provided').map(project=>({dataset:{project:project.id}}));
 context.projectIndex=projects.findIndex(project=>project.id==='courier-film');
 await context.nextProject(1);assert.equal(projects[calls.at(-1)].id,'tea-packaging');
});

function sheetContext(decode){
 const holder=element({}),status={textContent:''},image={src:'cover.webp',alt:'Cover'};
 const buttons=[element({projectSheet:'0'}),element({projectSheet:'1'})];
 buttons[0].attributes['aria-pressed']='true';buttons[1].attributes['aria-pressed']='false';
 const context=vm.createContext({projectSheetRequest:0,activeSheet:0,projectSheets:[{image:'cover',alt:'Cover'},{image:'spread',alt:'Spread'}],gallery:{open:true},
  $:selector=>selector==='#project-sheets'?holder:selector==='#project-sheet-status'?status:image,
  $$:()=>buttons,animateUI:async()=>true,Image:class{decode(){return decode();}}});
 vm.runInContext(part('async function showProjectSheet(','function setComparison('),context);
 return {context,holder,status,image,buttons};
}
test('opening another project returns its material strip to the first selected thumbnail',()=>{
 const holder=element({}),thumbs={scrollLeft:214,children:[],replaceChildren(){this.children=[];},append(child){this.children.push(child);}},status={textContent:''};
 const context=vm.createContext({projectSheetRequest:0,activeSheet:9,projectSheets:[],
  $:selector=>selector==='#project-sheets'?holder:selector==='#project-sheet-thumbs'?thumbs:status,
  document:{createElement(){return {...element({}),append(){}};}},showProjectSheet(){}});
 vm.runInContext(part('function configureProjectSheets(','async function showProjectSheet('),context);
 context.configureProjectSheets(projects.find(project=>project.id==='education-ai-magazine'));
 assert.equal(thumbs.scrollLeft,0);assert.equal(thumbs.children.length,7);
 assert.equal(thumbs.children[0].attributes['aria-pressed'],'true');
 assert.equal(status.textContent,'Материал 1 из 7');assert.equal(context.activeSheet,0);
});
test('returning to the current sheet cancels an outstanding image request',async()=>{
 let resolve;
 const state=sheetContext(()=>new Promise(done=>resolve=done));
 const pending=state.context.showProjectSheet(1);
 await state.context.showProjectSheet(0);resolve();await pending;
 assert.equal(state.image.src,'cover.webp');assert.equal(state.context.activeSheet,0);
 assert.equal(state.status.textContent,'Материал 1 из 2');
 assert.equal(state.holder.attributes['aria-busy'],undefined);
});
test('sheet load failure preserves the displayed image and retry can recover',async()=>{
 let fail=true;
 const state=sheetContext(()=>fail?Promise.reject(Error('offline')):Promise.resolve());
 await state.context.showProjectSheet(1);
 assert.equal(state.image.src,'cover.webp');assert.match(state.status.textContent,/Не удалось/);
 fail=false;await state.context.showProjectSheet(1);
 assert.equal(state.image.src,'/assets/spread-1920.webp');assert.equal(state.context.activeSheet,1);
 assert.equal(state.status.textContent,'Материал 2 из 2');assert.equal(state.buttons[1].attributes['aria-pressed'],'true');
});
