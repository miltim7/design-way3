import sharp from 'sharp';
import {readFile,mkdir} from 'node:fs/promises';
await mkdir('public/assets/services',{recursive:true});
for(const name of ['marketplace-card','product-before','product-background','business-video','music-video']){
 for(const width of [640,960,1280,1920]){
  await sharp(`assets-original/services/${name}.png`).resize({width}).webp({quality:86,effort:5}).toFile(`public/assets/services/${name}-${width}.webp`);
 }
}
const metadata=await sharp('assets-original/services/courier-character.png').metadata();
console.log('New examples optimized. Character alpha:',metadata.hasAlpha);
