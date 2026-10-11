import test from 'node:test';
import assert from 'node:assert/strict';
import katex from 'katex';
import {course,courseStats,searchableCourseText} from '../src/course/index.js';
import {readFileSync} from 'node:fs';
import {lessons} from '../src/lessons.js';
const chinese=text=>(text.match(/[\u4e00-\u9fff]/g)||[]).length;
test('all 22 official lecture units have complete teaching at every knowledge point',()=>{
 assert.equal(Object.keys(course).length,22);
 assert.equal(courseStats.sections,144);
 assert.equal(courseStats.examples,188);
 assert.equal(courseStats.questions,263);
 assert.equal(courseStats.derivationSteps,88);
 for(const [id,unit] of Object.entries(course)){
  assert.ok(unit.prerequisites.length&&unit.goals.length);
  assert.ok(unit.quiz.length>=11);
  assert.equal(unit.derivation.steps.length,4);
  for(const section of unit.sections){
   const message=`第 ${id} 讲：${section.title}`;
   assert.ok(section.paragraphs.length>=2,message);
   assert.ok(section.detail.reasoning.length>=2,message);
   assert.ok(section.detail.example.length>=4,message);
   for(const key of ['pitfall','question','answer'])assert.ok(section.detail[key].length>15,message);
   assert.ok(chinese(JSON.stringify(section))>=400,message);
  }
 }
});
test('block equations and every delimited inline equation parse strictly',()=>{
 let count=0;
 function visit(value,key=''){
  if(typeof value==='string'){
   const equations=key==='tex'&&value?[value]:[...value.matchAll(/\$([^$\n]+)\$/g)].map(x=>x[1]);
   for(const tex of equations){assert.doesNotThrow(()=>katex.renderToString(tex,{throwOnError:true,strict:'error',trust:false}),tex);count++;}
   assert.ok(!value.includes('$$'),'Block equations must be separate from paragraph text');
  }else if(Array.isArray(value))value.forEach(x=>visit(x,key));
  else if(value&&typeof value==='object')Object.entries(value).forEach(([k,v])=>visit(v,k));
 }
 visit(course);assert.ok(count>250);
});
test('questions and official PDF page references remain valid',()=>{
 const sources=JSON.parse(readFileSync(new URL('../src/course/sources.json',import.meta.url)));
 for(const [id,unit] of Object.entries(course)){
  for(const s of unit.sections){assert.ok(s.pages[0]>=1&&s.pages[1]>=s.pages[0]&&s.pages[1]<=sources[Number(id)-1].pages,`lecture ${id}: ${s.title}`);}
  for(const q of unit.quiz){
   assert.ok(Number.isInteger(q.section)&&q.section>=0&&q.section<unit.sections.length);
   if(q.type==='choice')assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.options.length);
   else if(q.type==='number')assert.ok(Number.isFinite(q.answer)&&Number.isFinite(q.tolerance)&&q.tolerance>=0);
   else assert.ok(q.type==='reflection'&&q.rubric.length>=2);
  }
 }
});
test('search includes reasoning, worked cases and misconceptions',()=>{
 assert.ok(searchableCourseText(course[2]).includes('对偶基'));
 for(const unit of Object.values(course))assert.ok(searchableCourseText(unit).includes(unit.sections.at(-1).detail.pitfall));
});
test('guided experiments load only valid controls and supported values',()=>{
 for(const lesson of lessons)for(const task of course[lesson.id].experiments)for(const [key,value] of Object.entries(task.params)){
  const control=lesson.controls.find(c=>c.key===key);assert.ok(control,`${lesson.id}: ${task.title}: ${key}`);
  if(control.type==='range')assert.ok(value>=control.min&&value<=control.max);
  if(control.type==='select')assert.ok(control.options.some(([option])=>option===value));
 }
});
