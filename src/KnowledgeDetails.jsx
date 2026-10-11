import React from 'react';
import {Formula} from './Formula';
import {RichText} from './RichText';
export function KnowledgeDetails({detail}){
 if(!detail)return null;
 return <div className="knowledge-details"><h3>把过程拆开理解</h3>{detail.reasoning.map((text,i)=><p key={i}><RichText>{text}</RichText></p>)}{detail.tex&&<div className="knowledge-equation"><Formula tex={detail.tex}/></div>}<div className="knowledge-case"><h4><RichText>{detail.example[0]}</RichText></h4><ol>{detail.example.slice(1).map((text,i)=><li key={i}><RichText>{text}</RichText></li>)}</ol></div><div className="knowledge-pitfall"><h4>实现时容易想错的一步</h4><p><RichText>{detail.pitfall}</RichText></p></div><div className="knowledge-check"><h4>停一下，检查是否理解</h4><p><RichText>{detail.question}</RichText></p><details><summary>展开推理与检查方法</summary><p><RichText>{detail.answer}</RichText></p></details></div></div>;
}
