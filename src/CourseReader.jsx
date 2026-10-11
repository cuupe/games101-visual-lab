import React,{useState} from 'react';
import {Formula,FormulaCard} from './Formula';
import {lectureUrl} from './lessons';
import {courseStats} from './course';
import {RichText} from './RichText';
import {DerivationWorkshop} from './DerivationWorkshop';
import {KnowledgeDetails} from './KnowledgeDetails';

export function CourseReader({lesson,unit,onLab,onQuiz}) {
 const [expanded,setExpanded]=useState(new Set());
 const jump=index=>document.getElementById(`reading-${lesson.id}-${index}`)?.scrollIntoView({behavior:'smooth',block:'start'});
 return <div className="reader-layout">
  <aside className="reader-toc" aria-label="本讲阅读目录"><span className="eyebrow">本讲路线</span>{unit.sections.map((section,index)=><button key={section.title} onClick={()=>jump(index)}><span>{String(index+1).padStart(2,'0')}</span>{section.title}</button>)}<button className="toc-deep" onClick={()=>document.getElementById("derivation-workshop")?.scrollIntoView({behavior:"smooth"})}>逐步推导与易错点 ↓</button><button onClick={()=>document.getElementById("worked-examples")?.scrollIntoView({behavior:"smooth"})}>算例与公式速查 ↓</button><div className="reader-actions"><button onClick={onLab}>进入引导实验 →</button><button onClick={onQuiz}>完成 {unit.quiz.length} 道自测 →</button></div></aside>
  <article className="course-article">
   <div className="curriculum-summary"><span>沿官方 22 讲学习</span><span>{courseStats.sections} 节讲解</span><span>{courseStats.examples} 个算例</span><span>{courseStats.questions} 道自测</span></div>
   <section className="learning-brief"><div><span className="eyebrow">开始之前</span><p>{unit.prerequisites.join('；')}</p></div><div><span className="eyebrow">学完应能做到</span><ul>{unit.goals.map(goal=><li key={goal}>{goal}</li>)}</ul></div></section>
   <p className="source-explanation">依据 GAMES101 官方讲次独立编写。每节右上角链接原讲义对应 PDF 页码；算例、自测及标明的实现补充为本站原创。</p>
   {unit.sections.map((section,index)=><section className="reading-section" id={`reading-${lesson.id}-${index}`} key={section.title}>
    <div className="reading-section-top"><span className="section-index">{String(index+1).padStart(2,'0')}</span><a href={`${lectureUrl(lesson.id)}#page=${section.pages[0]}`} target="_blank" rel="noreferrer">原课件 p.{section.pages.join('–')} ↗</a></div>
    <h2>{section.title}</h2>{section.paragraphs.map((text,i)=><p key={i}><RichText>{text}</RichText></p>)}
    {section.tex&&<div className="derivation-equation"><Formula tex={section.tex}/><small>把公式与上文的输入、输出和适用条件一起理解。</small></div>}
    {section.note&&<p className="boundary-note"><strong>约定与边界</strong><RichText>{section.note}</RichText></p>}
    <KnowledgeDetails detail={section.detail}/>
   </section>)}
   <DerivationWorkshop key={lesson.id} dive={unit.derivation}/><section className="worked-examples" id="worked-examples"><span className="eyebrow">动手推一遍</span><h2>逐步算例</h2>{unit.examples.map((example,i)=><div className="worked-example" key={example.title}><h3>{i+1}. {example.title}</h3><p><RichText>{example.question}</RichText></p><button className="text-link" aria-expanded={expanded.has(i)} onClick={()=>setExpanded(old=>{const next=new Set(old);next.has(i)?next.delete(i):next.add(i);return next;})}>{expanded.has(i)?'收起推导':'先自己计算，再展开推导'} <span>↓</span></button>{expanded.has(i)&&<div className="worked-solution"><ol>{example.steps.map(step=><li key={step}><RichText>{step}</RichText></li>)}</ol><p><strong>结论：</strong><RichText>{example.answer}</RichText></p></div>}</div>)}</section>
   <section className="formula-reference"><span className="eyebrow">查阅与回顾</span><h2>主实验公式与变量</h2>{lesson.formulas.map((formula,index)=><FormulaCard key={formula.name} formula={formula} index={index}/>)}</section>
   <div className="reading-end"><p>先预测画面的变化，再用实验检验；最后用自测找出仍不确定的环节。</p><button className="primary-button" onClick={onLab}>开始引导实验 →</button><button className="reset-button" onClick={onQuiz}>进入本讲自测</button></div>
  </article>
 </div>;
}

