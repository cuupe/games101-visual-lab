import test from 'node:test';
import assert from 'node:assert/strict';
import {gradeQuestion} from '../src/quizGrading.js';
test('blank or nonfinite responses never count as correct',()=>{
 const choice={type:'choice',answer:0},numeric={type:'number',answer:0,tolerance:.001};
 for(const v of ['', ' ', 'NaN', 'Infinity']){assert.equal(gradeQuestion(choice,v),false);assert.equal(gradeQuestion(numeric,v),false);}
});
test('numeric answers accept scientific notation within the stated tolerance',()=>{
 const q={type:'number',answer:.001,tolerance:.000001};
 assert.equal(gradeQuestion(q,'1e-3'),true);assert.equal(gradeQuestion(q,.0010005),true);assert.equal(gradeQuestion(q,.00101),false);
 assert.equal(gradeQuestion({type:'reflection'},'complete explanation'),false);
});
