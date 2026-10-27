import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
const root=resolve('dist');
async function files(dir){let all=[];for(const item of await readdir(dir,{withFileTypes:true})){const path=resolve(dir,item.name);if(item.isDirectory())all.push(...await files(path));else all.push(path);}return all;}
const htmls=(await files(root)).filter(p=>p.endsWith('.html'));
for(const path of htmls){
 const html=await readFile(path,'utf8');
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,`Duplicate id in ${path}`);
 for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  const link=match[1];
  if(link.startsWith('#')){assert(ids.includes(link.slice(1)),`Missing fragment ${link} in ${path}`);continue;}
  if(!link.startsWith('/')||link.startsWith('//'))continue;
  const [pathWithQuery,fragment]=link.split('#');const part=pathWithQuery.split('?')[0];const target=resolve(root,'.'+part);
  const info=await stat(target).catch(()=>null);assert(info,`Missing ${link} in ${path}`);
  if(info.isDirectory())assert((await stat(resolve(target,'index.html'))).isFile());
  if(fragment){const targetHtml=await readFile(info.isDirectory()?resolve(target,'index.html'):target,'utf8');assert(targetHtml.includes(`id="${fragment}"`),`Missing fragment ${link}`);}
 }
 for(const match of html.matchAll(/\b(?:aria-controls|aria-labelledby|aria-describedby)="([^"]+)"/g))for(const id of match[1].split(/\s+/))assert(ids.includes(id),`Missing ARIA target ${id} in ${path}`);
 for(const match of html.matchAll(/\bsrcset="([^"]+)"/g))for(const candidate of match[1].split(',')){const src=candidate.trim().split(/\s+/)[0];if(src.startsWith('/'))assert((await stat(resolve(root,'.'+src))).isFile(),`Missing responsive image ${src}`);}
 assert(html.includes('lang="ru"'));assert(html.includes('name="viewport"'));
}
const data=JSON.parse(await readFile(resolve(root,'content.json'),'utf8'));
const home=await readFile(resolve(root,'index.html'),'utf8'),portfolio=await readFile(resolve(root,'portfolio/index.html'),'utf8');
const projectTags=html=>[...html.matchAll(/<article class="project [^"]+"[^>]*>/g)].map(match=>match[0]);
assert(home.includes('data-page-size="6"')&&home.includes('data-gallery-pagination'),'Homepage pagination missing');
assert.equal(projectTags(home).filter(tag=>!tag.includes(' hidden')).length,6,'Homepage must initially show six projects');
assert.equal(projectTags(portfolio).filter(tag=>!tag.includes(' hidden')).length,data.projects.length,'Detailed portfolio must remain complete');
assert(!portfolio.includes('data-gallery-pagination'),'Pagination should apply only to the homepage');
for(const p of data.projects)for(const size of [640,1280,1920])assert((await stat(resolve(root,`assets/${p.image}-${size}.webp`))).size>1000);
for(const p of data.projects){
 if(p.video)assert((await stat(resolve(root,'.'+p.video))).size>1000,`Missing video ${p.id}`);
 if(p.captions)assert((await readFile(resolve(root,'.'+p.captions),'utf8')).startsWith('WEBVTT'),`Invalid captions ${p.id}`);
 if(p.before)for(const size of [640,1280,1920])assert((await stat(resolve(root,`assets/${p.before}-${size}.webp`))).size>1000,`Missing comparison ${p.id}`);
 assert(p.service==='other'||data.services.some(s=>s.id===p.service),`Unknown project service ${p.id}`);
 for(const image of p.gallery||[])for(const size of [640,1280,1920])assert((await stat(resolve(root,`assets/${image.image}-${size}.webp`))).size>1000,`Missing project gallery image ${image.image}`);
}
const serviceArt=JSON.parse(await readFile('src/service-art.json','utf8'));
for(const item of serviceArt)for(const size of [640,960])assert((await stat(resolve(root,`assets/services/${item.image || item.id}-${size}.webp`))).size>1000);
console.log(`Checked ${htmls.length} pages: local links/assets, anchors, unique IDs, metadata and responsive images.`);
