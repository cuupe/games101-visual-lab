import React,{useEffect,useId,useRef,useState} from 'react';
import manifest from '../public/illustrations/manifest.json';
import './visuals.css';

export const illustrationStats={images:manifest.images,groups:manifest.groups};
const diagramURL=src=>`${import.meta.env.BASE_URL}${src.replace(/^\/+/, '')}`;

function DiagramImage({image,eager=false}){
 const [failed,setFailed]=useState(false);
 return failed?<div className="diagram-unavailable" role="status">图片加载失败，请刷新或下载原图查看。</div>:<img src={diagramURL(image.src)} alt={image.title+'。'+image.caption} width={image.width} height={image.height} loading={eager?'eager':'lazy'} decoding="async" onError={()=>setFailed(true)}/>;
}

function DiagramViewer({group,initial,onClose,returnFocus}){
 const [index,setIndex]=useState(initial),dialog=useRef(null),captionId=useId(),image=group.panels[index];
 useEffect(()=>{
  const element=dialog.current;
  element.showModal();
  return ()=>{element.close();if(returnFocus?.isConnected)returnFocus.focus();};
 },[returnFocus]);
 return <dialog ref={dialog} className="diagram-viewer" aria-label={group.section+'：图解放大'} aria-describedby={captionId}
  onCancel={event=>{event.preventDefault();onClose();}}
  onClose={event=>{if(!event.currentTarget.open)onClose();}}
  onClick={event=>{if(event.target===event.currentTarget)onClose();}}
  onKeyDown={event=>{
   if(event.key==='ArrowLeft'){event.preventDefault();setIndex(i=>Math.max(0,i-1));}
   if(event.key==='ArrowRight'){event.preventDefault();setIndex(i=>Math.min(group.panels.length-1,i+1));}
  }}>
  <div className="diagram-viewer-inner">
   <div className="diagram-viewer-top"><span>{group.section}</span><button onClick={onClose} aria-label="关闭图解">关闭 ×</button></div>
   <h2>{image.title}</h2><DiagramImage key={image.src} image={image} eager/>
   <p id={captionId}>{image.caption}</p>
   <div className="diagram-viewer-bottom"><button onClick={()=>setIndex(i=>i-1)} disabled={index===0}>← 上一幅</button><span>{index+1} / {group.panels.length}</span><button onClick={()=>setIndex(i=>i+1)} disabled={index===group.panels.length-1}>下一幅 →</button><a href={diagramURL(image.src)} download>下载 SVG 原图</a></div>
  </div>
 </dialog>;
}

export function VisualExamples({lessonId,sectionIndex}){
 const group=manifest.lectures[lessonId]?.groups[sectionIndex], [active,setActive]=useState(null),trigger=useRef(null);
 if(!group)return null;
 return <div className="visual-examples">
  <div className="visual-example-heading"><span className="eyebrow">先看图，再读推理</span><span>点击放大 · 左右比较</span></div>
  <p className="visual-question">{group.focus}</p>
  <div className="visual-gallery" aria-label={group.section+'：三幅图解'}>
   {group.panels.map((image,index)=><figure key={image.src}>
    <button className="diagram-trigger" onClick={event=>{trigger.current=event.currentTarget;setActive(index);}} aria-label={'放大图解：'+image.title}>
     <DiagramImage image={image}/><span className="diagram-zoom" aria-hidden="true">↗</span>
    </button>
    <figcaption><strong><span>{index+1}</span>{image.title}</strong><p>{image.caption}</p></figcaption>
   </figure>)}
  </div>
  <span className="visual-mobile-hint">左右滑动查看三幅图，点击任意图片可放大</span>
  {active!==null&&<DiagramViewer group={group} initial={active} returnFocus={trigger.current} onClose={()=>setActive(null)}/>}
 </div>;
}

export function LessonVisualOverview({lessonId,onJump}){
 const groups=manifest.lectures[lessonId]?.groups;
 if(!groups)return null;
 const indices=[0,Math.floor(groups.length/2),groups.length-1];
 return <section className="lesson-visual-overview" aria-label="本讲图像预览">
  <div className="visual-overview-heading"><span className="eyebrow">从图像进入本讲</span><span>本讲 {groups.length*3} 幅图解 · 点击跳到知识点</span></div>
  <div className="visual-overview-grid">{indices.map((index,i)=>{
   const group=groups[index],image=group.panels[0];
   return <button key={index} onClick={()=>onJump(index)}>
    <DiagramImage image={image} eager={i===0}/><span><small>{String(index+1).padStart(2,'0')}</small>{group.section}<b aria-hidden="true">↘</b></span>
   </button>;
  })}</div>
 </section>;
}
