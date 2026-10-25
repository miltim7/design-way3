import sharp from 'sharp';
import { readFile, mkdir } from 'node:fs/promises';

const briefs=JSON.parse(await readFile('src/service-art.json','utf8'));
await mkdir('public/assets/services',{recursive:true});
for(const {id,image=id} of briefs){
  for(const width of [640,960]){
    await sharp(`assets-original/services/${image}.png`)
      .resize(width,Math.round(width*2/3),{fit:'cover'})
      .webp({quality:82,effort:5})
      .toFile(`public/assets/services/${image}-${width}.webp`);
  }
}
console.log(`Optimized ${briefs.length} service examples at 640 and 960px.`);
