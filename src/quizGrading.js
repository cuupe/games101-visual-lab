export function gradeQuestion(question,value){
 if(String(value).trim()==='')return false;
 if(question.type==='choice')return Number.isInteger(Number(value))&&Number(value)===question.answer;
 if(question.type==='number')return Number.isFinite(Number(value))&&Math.abs(Number(value)-question.answer)<=question.tolerance;
 return false;
}
