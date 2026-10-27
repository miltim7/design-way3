import sharp from 'sharp';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
const assets=JSON.parse(await readFile('src/designer-assets.json','utf8'));
await mkdir('public/assets/designer',{recursive:true});
for(const asset of assets){
 for(const width of [640,1280,1920]){
  const output=`public/assets/designer/${asset.name}-${width}.webp`;
  await sharp(`assets-original/designer/${asset.source}`).rotate().resize({width,withoutEnlargement:true}).webp({quality:91,effort:5}).toFile(output);
  await writeFile(output+'.json',JSON.stringify({origin:'Client-supplied original portfolio material, received 27 October 2026.',receivedFile:asset.receivedFile},null,2)+'\n');
 }
}
for(const width of [320,640,853]){
 const output=`public/assets/designer/nikolay-${width}.webp`;
 await sharp('assets-original/designer/nikolay.jpg').rotate().resize({width,withoutEnlargement:true}).webp({quality:90,effort:5}).toFile(output);
 await writeFile(output+'.json',JSON.stringify({origin:'Client-supplied portrait, received 27 October 2026.',receivedFile:'photo_2026-10-26_23-54-44.jpg'},null,2)+'\n');
}
console.log(`Optimized ${assets.length} portfolio originals and 3 portrait sizes; original pixels and lettering retained.`);
