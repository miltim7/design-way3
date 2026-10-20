import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { projects } from '../src/content.mjs';
await mkdir('public/assets',{recursive:true});
for(const name of new Set(projects.map(project=>project.image))){
 await mkdir(dirname(`public/assets/${name}-640.webp`),{recursive:true});
 for(const width of [640,1280,1920]) await sharp(`assets-original/${name}.png`).resize({width,withoutEnlargement:false}).webp({quality:82,effort:5}).toFile(`public/assets/${name}-${width}.webp`);
}
await sharp('assets-original/coffee.png').resize(1200,630,{fit:'cover'}).jpeg({quality:85}).toFile('public/assets/og-image.jpg');
for(const width of [640,1280]) await sharp('assets-original/coffee-sketch.png').resize({width}).webp({quality:84,effort:5}).toFile(`public/assets/coffee-sketch-${width}.webp`);
console.log(`Optimized ${projects.length} concepts at 640, 1280, 1920px, plus Open Graph.`);

for(const width of [768,1280,1672]) await sharp("assets-original/hero-studio.png").resize({width,withoutEnlargement:true}).webp({quality:84,effort:5}).toFile(`public/assets/hero-studio-${width}.webp`);
