import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {course} from '../src/course/index.js';

const manifest=JSON.parse(readFileSync(new URL('../public/illustrations/manifest.json',import.meta.url),'utf8'));
test('every knowledge point has a corresponding set of three image examples',()=>{
 let groups=0,images=0;
 assert.equal(Object.keys(manifest.lectures).length,22);
 for(const [id,unit] of Object.entries(course)){
  const lecture=manifest.lectures[id];
  assert.equal(lecture.title,unit.title);
  assert.equal(lecture.groups.length,unit.sections.length);
  lecture.groups.forEach((group,index)=>{
   assert.equal(group.section,unit.sections[index].title);
   assert.ok(group.focus.length>=10,'A specific reading question is required');
   assert.equal(group.panels.length,3);
   groups++;images+=group.panels.length;
  });
 }
 assert.equal(manifest.groups,groups);assert.equal(manifest.images,images);
 assert.equal(groups,144);assert.equal(images,432);
});
test('all diagram files are accessible standalone SVGs with distinct visual bodies',()=>{
 const paths=new Set();
 for(const lecture of Object.values(manifest.lectures))for(const group of lecture.groups){
  const hashes=new Set();
  for(const image of group.panels){
   assert.match(image.src,/^\/illustrations\/\d{2}-\d{2}-[123]\.svg\?v=[a-f0-9]{12}$/);
   assert.ok(!paths.has(image.src));paths.add(image.src);
   assert.ok(image.title&&image.caption.length>=12);
   const svg=readFileSync(new URL('../public'+image.src.split('?')[0],import.meta.url),'utf8');
   assert.equal(image.src.split('?v=')[1],createHash('sha256').update(svg).digest('hex').slice(0,12));
   assert.match(svg,/viewBox="0 0 360 264"/);
   assert.match(svg,/<title>.+<\/title>/);
   assert.match(svg,/<desc>.+<\/desc>/);
   const geometry=svg.replace(/data:image\/png;base64,[A-Za-z0-9+/=]+/g,'embedded-png');
   assert.doesNotMatch(geometry,/NaN|Infinity|undefined|<script|<foreignObject|https?:\/\/(?!www\.w3\.org)/);
   const body=svg.replace(/<(title|desc)>[\s\S]*?<\/\1>/g,'');
   hashes.add(createHash('sha256').update(body).digest('hex'));
  }
  assert.equal(hashes.size,3,'Three diagrams must differ: '+group.section);
 }
 assert.equal(paths.size,432);
});
