import {RichText} from './RichText';
import React,{useEffect,useState} from 'react';
import {gradeQuestion} from './quizGrading';
export {gradeQuestion} from './quizGrading';

const recordKey=id=>`games101-quiz-v2-${id}`;
function readRecords(id){try{const records=JSON.parse(localStorage.getItem(recordKey(id))||'{}');return records&&typeof records==='object'&&!Array.isArray(records)?records:{};}catch{return {};}}
export function QuizBank({lesson,unit,onTheory,onLab}){
 const [records,setRecords]=useState(()=>readRecords(lesson.id)),[index,setIndex]=useState(0),[mode,setMode]=useState('all');
 const [reviewIds,setReviewIds]=useState([]);
 const questions=unit.quiz;
 const filtered=mode==='all'?questions.map((q,i)=>i):reviewIds;
 const current=filtered.includes(index)?index:filtered[0];
 const question=questions[current],record=records[current]||{},answer=record.answer??'';
 useEffect(()=>{try{localStorage.setItem(recordKey(lesson.id),JSON.stringify(records));}catch{}},[records,lesson.id]);
 const update=patch=>setRecords(old=>({...old,[current]:{...old[current],...patch}}));
 const objective=questions.filter(q=>q.type!=='reflection').length;
 const correct=questions.filter((q,i)=>q.type!=='reflection'&&records[i]?.correct===true).length;
 const reflected=questions.filter((q,i)=>q.type==='reflection'&&records[i]?.reviewed).length;
 const move=delta=>{const position=filtered.indexOf(current);setIndex(filtered[Math.max(0,Math.min(filtered.length-1,position+delta))]);};
 return <div className="question-workspace"><aside className="question-nav"><span className="eyebrow">理解检查 · {questions.length} 题</span><p><strong>{correct} / {objective}</strong> 客观题答对</p><p>{reflected} 道解释题已对照要点</p><div className="question-filter"><button aria-pressed={mode==='all'} onClick={()=>setMode('all')}>全部题目</button><button aria-pressed={mode==='wrong'} onClick={()=>{setReviewIds(questions.map((q,i)=>i).filter(i=>records[i]?.checked&&records[i]?.correct===false));setMode('wrong');}}>复习错题</button></div><div className="question-grid">{filtered.map(i=><button key={i} aria-label={`第 ${i+1} 题${records[i]?.correct?'，已答对':''}`} aria-current={current===i?'step':undefined} className={`${current===i?'active':''} ${records[i]?.correct?'passed':records[i]?.checked&&questions[i].type!=='reflection'?'failed':''}`} onClick={()=>setIndex(i)}>{i+1}</button>)}</div><p className="quiz-persistence">答案与错题保存在当前浏览器。解释题需自己对照要点，不自动判分。</p></aside>
 {!question?<section className="quiz-card"><h2>当前没有已记录的错题</h2><p>可以继续完成其余题目，或重新检查已经答对的推导。</p><button className="text-link" onClick={()=>setMode('all')}>返回全部题目 →</button></section>:<section className="quiz-card"><span className="quiz-kicker">第 {current+1} / {questions.length} 题 · {question.type==='choice'?'概念辨析':question.type==='number'?'数值计算':'解释与迁移'}</span><h2><RichText>{question.question}</RichText></h2>
 {question.type==='choice'&&<fieldset><legend className="sr-only">选择答案</legend>{question.options.map((option,i)=><label key={option} className={`quiz-option ${answer===i?'chosen':''} ${record.checked&&i===question.answer?'correct':''} ${record.checked&&answer===i&&i!==question.answer?'wrong':''}`}><input type="radio" name={`q-${lesson.id}-${current}`} checked={answer===i} onChange={()=>update({answer:i,checked:false,correct:null})}/><span>{String.fromCharCode(65+i)}</span><p><RichText>{option}</RichText></p></label>)}</fieldset>}
 {question.type==='number'&&<label className="numeric-answer">你的计算结果<div><input type="number" step="any" value={answer} onChange={e=>update({answer:e.target.value,checked:false,correct:null})}/><span>{question.unit}</span></div><small>支持小数与科学计数法；请先把分数算成数值。</small></label>}
 {question.type==='reflection'&&<label className="reflection-answer">先写下你的解释<textarea rows={5} value={answer} onChange={e=>update({answer:e.target.value,reviewed:false,checked:false})} placeholder="写出原因、条件和一个验证办法…"/></label>}
 <button className="primary-button" disabled={String(answer).trim()===''} onClick={()=>update({checked:true,correct:question.type==='reflection'?null:gradeQuestion(question,answer)})}>{question.type==='reflection'?'对照思考要点':'检查答案'} →</button>
 {record.checked&&<div role="status" className={`quiz-feedback ${record.correct?'success':''}`}><strong>{question.type==='reflection'?'用这些要点审阅自己的答案':record.correct?'回答正确':'这一步还需要重新检查'}</strong>{question.type==='reflection'?<><ul>{question.rubric.map(point=><li key={point}><RichText>{point}</RichText></li>)}</ul><label className="checkbox-control"><input type="checkbox" checked={!!record.reviewed} onChange={e=>update({reviewed:e.target.checked})}/>我已逐项比较，并能解释这些要点</label></>:<p><RichText>{question.explain}</RichText></p>}<div className="feedback-actions"><button className="text-link" onClick={()=>onTheory(question.section)}>回到相关原理 →</button><button className="text-link" onClick={onLab}>去实验验证 →</button></div></div>}
 <div className="question-pager"><button disabled={filtered.indexOf(current)<=0} onClick={()=>move(-1)}>← 上一题</button><button disabled={filtered.indexOf(current)>=filtered.length-1} onClick={()=>move(1)}>下一题 →</button></div>
 </section>}</div>;
}
