import {existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
import {course} from '../src/course/index.js';
import {foundationVisuals} from './illustrations/foundations.mjs';
import {rasterGeometryVisuals} from './illustrations/raster-geometry.mjs';
import {transportVisuals} from './illustrations/transport.mjs';
import {imagingAnimationVisuals} from './illustrations/imaging-animation.mjs';
import {wrap} from './illustrations/primitives.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const destination=resolve(root,'public/illustrations');
mkdirSync(destination,{recursive:true});
function writeChanged(path,content){if(!existsSync(path)||readFileSync(path,'utf8')!==content)writeFileSync(path,content);}
const assets={...foundationVisuals,...rasterGeometryVisuals,...transportVisuals,...imagingAnimationVisuals};
const manifest={version:1,source:'Independently authored diagrams following the GAMES101 2020 lecture topics.',images:0,groups:0,lectures:{}};
for(const [id,unit] of Object.entries(course)){
 const groups=assets[id];
 if(groups?.length!==unit.sections.length)throw new Error('Illustrations missing for lecture '+id);
 manifest.lectures[id]={title:unit.title,groups:groups.map((group,sectionIndex)=>{
  if(!group.focus||group.panels.length!==3)throw new Error('Three distinct panels are required: '+id+'-'+sectionIndex);
  const panels=group.panels.map((panel,imageIndex)=>{
   const geometry=panel.svg?.replace(/data:image\/png;base64,[A-Za-z0-9+/=]+/g,'embedded-png');
   if(!panel.title||!panel.caption||!panel.svg||/NaN|undefined|Infinity|<script|<foreignObject|https?:\/\//.test(geometry))throw new Error('Invalid illustration: '+id+'-'+sectionIndex+'-'+imageIndex);
   const name=String(id).padStart(2,'0')+'-'+String(sectionIndex+1).padStart(2,'0')+'-'+(imageIndex+1)+'.svg';
   const svg=wrap(panel.svg,panel.title,panel.caption),version=createHash('sha256').update(svg).digest('hex').slice(0,12);
   writeChanged(resolve(destination,name),svg);
   manifest.images++;
   return {title:panel.title,caption:panel.caption,src:'/illustrations/'+name+'?v='+version,width:360,height:264};
  });
  manifest.groups++;
  return {section:unit.sections[sectionIndex].title,focus:group.focus,panels};
 })};
}
writeChanged(resolve(destination,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log('Generated '+manifest.images+' SVG illustrations for '+manifest.groups+' knowledge points in '+Object.keys(manifest.lectures).length+' lectures.');
