import React,{memo,useMemo} from 'react';
import katex from 'katex';
export function normalizeTex(input){const tex=String(input??'').trim();if(tex.startsWith('$$')&&tex.endsWith('$$'))return tex.slice(2,-2);if(tex.startsWith('$')&&tex.endsWith('$'))return tex.slice(1,-1);if((tex.startsWith('\\(')&&tex.endsWith('\\)'))||(tex.startsWith('\\[')&&tex.endsWith('\\]')))return tex.slice(2,-2);return tex;}
export const Formula=memo(function Formula({tex,block=true}){
 const result=useMemo(()=>{try{return {html:katex.renderToString(normalizeTex(tex),{displayMode:block,throwOnError:true,strict:'ignore',trust:false,output:'htmlAndMathml'})};}catch(error){return {error:error.message};}},[tex,block]);
 const Tag=block?'div':'span';
 return result.error?<Tag className="formula-render-error" title={result.error}>公式暂时无法显示：<code>{tex}</code></Tag>:<Tag className={block?'formula-math':'formula-inline'} dangerouslySetInnerHTML={{__html:result.html}}/>;
});
export function FormulaCard({formula,index}){return <article className="formula-card"><div className="formula-card-title"><span>{String(index+1).padStart(2,'0')}</span><h3>{formula.name}</h3></div><Formula tex={formula.tex}/><p className="formula-purpose">{formula.why}</p><dl>{formula.terms.map(([symbol,meaning])=><div key={symbol}><dt>{/[\u4e00-\u9fff]/.test(symbol)?symbol:<Formula tex={symbolTex(symbol)} block={false}/>}</dt><dd>{meaning}</dd></div>)}</dl></article>;}

function symbolTex(s){const symbols={'θ':'\\theta ','α':'\\alpha ','β':'\\beta ','γ':'\\gamma ','ρ':'\\rho ','ω':'\\omega ','σ':'\\sigma ','Δ':'\\Delta ','₀':'_0','₁':'_1','₂':'_2','₃':'_3','²':'^2','×':'\\times ','·':'\\cdot ','…':'\\ldots ','′':"'"};if(s==='â')return '\\hat a';if(s==='‖a‖')return '\\lVert a\\rVert';return [...s].map(c=>symbols[c]||c).join('').replace(/_([a-z]{2,})/g,'_{$1}').replace('normalize','\\operatorname{normalize}').replace('cos ','\\cos ').replace('sin ','\\sin ');}
