import {foundations} from './foundations.js';
import {rasterization} from './rasterization.js';
import {geometry} from './geometry.js';
import {raytracing} from './raytracing.js';
import {appearance} from './appearance.js';
import {imaging} from './imaging.js';
import {animation} from './animation.js';
import {extraQuestions} from './extra-questions.js';
import {derivations} from './derivations.js';
import {middleDerivations} from './derivations-middle.js';
import {advancedDerivations} from './derivations-advanced.js';
import {deepFoundations} from './deep-foundations.js';
import {deepRasterization} from './deep-rasterization.js';
import {deepGeometry} from './deep-geometry.js';
import {deepImagingAnimation} from './deep-imaging-animation.js';
import {deepTransport} from './deep-transport.js';
import {foundationImplementation} from './deep-foundation-implementation.js';

export const course={...foundations,...rasterization,...geometry,...raytracing,...appearance,...imaging,...animation};
const dives={...derivations,...middleDerivations,...advancedDerivations};
const details={...deepFoundations,...deepRasterization,...deepGeometry,...deepTransport,...deepImagingAnimation};
for(const [id,unit] of Object.entries(course)){
 unit.quiz.push(...extraQuestions[id]);
 unit.derivation=dives[id];
 if(details[id]?.length!==unit.sections.length)throw new Error(`第 ${id} 讲缺少逐点详解`);
 unit.sections.forEach((section,i)=>{
  section.detail=details[id][i];
  if(foundationImplementation[id])section.detail.reasoning.push(foundationImplementation[id][i]);
 });
}
export const courseStats=Object.values(course).reduce((stats,unit)=>({
 sections:stats.sections+unit.sections.length,
 examples:stats.examples+unit.examples.length+unit.sections.length,
 questions:stats.questions+unit.quiz.length,
 checkpoints:stats.checkpoints+unit.sections.length,
 experiments:stats.experiments+unit.experiments.length,
 derivationSteps:stats.derivationSteps+unit.derivation.steps.length,
}),{sections:0,examples:0,questions:0,checkpoints:0,experiments:0,derivationSteps:0});
export function searchableCourseText(unit){
 return [unit.title,...unit.sections.flatMap(s=>[s.title,...s.paragraphs,...s.detail.reasoning,...s.detail.example,s.detail.pitfall,s.detail.question,s.detail.answer])].join(' ');
}
