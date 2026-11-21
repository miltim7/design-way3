import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(process.argv[2]||'.');
const website=new URL('https://check.invalid/');
const htmls=(await readdir(root)).filter(name=>name.endsWith('.html'));
assert.equal(htmls.length,11);
async function checkLink(link,page){
 const url=new URL(link,new URL(page,website));
 if(url.origin!==website.origin)return;
 const target=resolve(root,'.'+url.pathname);
 assert((await stat(target)).isFile(),`Missing ${link} in ${page}`);
 if(url.hash){
  const html=await readFile(target,'utf8');
  assert(html.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`),`Missing fragment ${link} in ${page}`);
 }
}
for(const path of htmls){
 const html=await readFile(resolve(root,path),'utf8');
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,`Duplicate id in ${path}`);
 for(const [,link] of html.matchAll(/\b(?:href|src|poster)="([^"]+)"/g))await checkLink(link,path);
 for(const match of html.matchAll(/\b(?:aria-controls|aria-labelledby|aria-describedby)="([^"]+)"/g))for(const id of match[1].split(/\s+/))assert(ids.includes(id),`Missing ARIA target ${id} in ${path}`);
 for(const [,srcset] of html.matchAll(/\bsrcset="([^"]+)"/g))for(const candidate of srcset.split(','))await checkLink(candidate.trim().split(/\s+/)[0],path);
 assert(html.includes('lang="ru"'));assert(html.includes('name="viewport"'));
}
const data=JSON.parse(await readFile(resolve(root,'assets/content.json'),'utf8'));
const home=await readFile(resolve(root,'index.html'),'utf8'),portfolio=await readFile(resolve(root,'portfolio.html'),'utf8');
const projectTags=html=>[...html.matchAll(/<article class="project [^"]+"[^>]*>/g)].map(match=>match[0]);
assert(home.includes('data-page-size="8"')&&home.includes('data-gallery-pagination'),'Homepage pagination missing');
assert.equal(projectTags(home).filter(tag=>!tag.includes(' hidden')).length,8,'Homepage must initially show eight projects');
assert.equal(projectTags(portfolio).filter(tag=>!tag.includes(' hidden')).length,data.projects.length,'Detailed portfolio must remain complete');
assert(!portfolio.includes('data-gallery-pagination'),'Pagination should apply only to the homepage');
for(const p of data.projects)for(const size of [640,1280,1920])assert((await stat(resolve(root,`assets/images/${p.image}-${size}.webp`))).size>1000);
for(const p of data.projects){
 if(p.video)assert((await stat(resolve(root,p.video))).size>1000,`Missing video ${p.id}`);
 if(p.poster)await checkLink(p.poster,'index.html');
 if(p.captions)assert((await readFile(resolve(root,p.captions),'utf8')).startsWith('WEBVTT'),`Invalid captions ${p.id}`);
 if(p.before)for(const size of [640,1280,1920])assert((await stat(resolve(root,`assets/images/${p.before}-${size}.webp`))).size>1000,`Missing comparison ${p.id}`);
 assert(p.service==='other'||data.services.some(s=>s.id===p.service),`Unknown project service ${p.id}`);
 for(const image of p.gallery||[])for(const size of [640,1280,1920])assert((await stat(resolve(root,`assets/images/${image.image}-${size}.webp`))).size>1000,`Missing project gallery image ${image.image}`);
}
const css=await readFile(resolve(root,'assets/globals.css'),'utf8');
for(const [,link] of css.matchAll(/url\(['"]?([^'")]+)['"]?\)/g))await checkLink(link,'assets/globals.css');
console.log(`Checked ${htmls.length} pages: local links/assets, anchors, unique IDs, metadata and responsive images.`);
