import sharp from 'sharp';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {additionalProjects} from '../src/additional-projects.mjs';

await mkdir('public/assets/portfolio',{recursive:true});
for(const project of additionalProjects){
  const prompt=(await readFile(`assets-original/portfolio/${project.id}.prompt.txt`,'utf8')).trimEnd();
  for(const width of [640,1280,1920]){
    const output=`public/assets/portfolio/${project.id}-${width}.webp`;
    await sharp(`assets-original/portfolio/${project.id}.png`)
      .resize({width})
      .webp({quality:87,effort:5})
      .toFile(output);
    await writeFile(output+'.json',JSON.stringify({prompt},null,2)+'\n');
  }
}
console.log(`Optimized ${additionalProjects.length} portfolio images at three sizes.`);
