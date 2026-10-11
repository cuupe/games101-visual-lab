import React,{useEffect,useRef,useState} from 'react';
import {Renderer} from './renderer';
import {renderScene,initialPoints,threeD,newSimulation,updateSimulation} from './scenes';
import {clamp} from './math';
export function LabCanvas({lesson,params,playing,resetToken,onMetrics,onPause}){
 const canvas=useRef(null),latest=useRef({params,playing,onMetrics,onPause}),renderer=useRef(null),[error,setError]=useState(''),[labels,setLabels]=useState([]);
 latest.current={params,playing,onMetrics,onPause};
 useEffect(()=>{
  let r,raf,alive=true,dirty=true,last=0,lastSent=0,lastParams='',lastTrace='',drag=null,selected=0;let lastPhysics='';let state={points:initialPoints.map(p=>[...p]),sim:newSimulation()};
  setError('');const element=canvas.current;
  try{r=new Renderer(element);renderer.current=r;}catch(e){setError(e.message);return;}
  const observer=new ResizeObserver(()=>{dirty=true;});observer.observe(element);
  function coords(e){const bounds=element.getBoundingClientRect();return [((e.clientX-bounds.left)/bounds.width*2-1)*r.extentX,(1-(e.clientY-bounds.top)/bounds.height*2)*r.extentY];}
  const pointerdown=e=>{element.focus({preventScroll:true});const pt=coords(e);let point=-1;if(lesson.id===11)point=state.points.findIndex(p=>Math.hypot(p[0]-pt[0],p[1]-pt[1])<.25);if(point>=0)selected=point;drag={x:e.clientX,y:e.clientY,point};element.setPointerCapture(e.pointerId);};
  const pointermove=e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;if(lesson.id===11&&drag.point>=0){const pt=coords(e);state.points[drag.point]=[clamp(pt[0],-2.8,2.8),clamp(pt[1],-1.7,1.7)];dirty=true;}else if(threeD.has(lesson.id)&&![4,9].includes(lesson.id)){r.yaw-=dx*.008;r.pitch=clamp(r.pitch+dy*.008,-1.15,1.15);r.sample=0;dirty=true;}};
  const pointerup=()=>drag=null;
  const wheel=e=>{if(!threeD.has(lesson.id)||[4,9].includes(lesson.id))return;e.preventDefault();r.zoom=clamp(r.zoom*Math.exp(e.deltaY*.001),.6,2);r.sample=0;dirty=true;};
  const keydown=e=>{if(lesson.id===11&&/^[1-4]$/.test(e.key)){selected=Number(e.key)-1;dirty=true;return;}const directions={ArrowLeft:[-.06,0],ArrowRight:[.06,0],ArrowUp:[0,.06],ArrowDown:[0,-.06]};const d=directions[e.key];if(!d)return;if(lesson.id===11){e.preventDefault();state.points[selected]=[clamp(state.points[selected][0]+d[0],-2.8,2.8),clamp(state.points[selected][1]+d[1],-1.7,1.7)];dirty=true;}else if(threeD.has(lesson.id)&&![4,9].includes(lesson.id)){e.preventDefault();r.yaw+=d[0];r.pitch=clamp(r.pitch+d[1],-1.15,1.15);r.sample=0;dirty=true;}};
  const lost=e=>{e.preventDefault();setError('WebGL 上下文已丢失。点击“重新创建画面”恢复；课程文字与参数仍保留。');alive=false;};
  element.addEventListener('pointerdown',pointerdown);element.addEventListener('pointermove',pointermove);element.addEventListener('pointerup',pointerup);element.addEventListener('pointercancel',pointerup);element.addEventListener('wheel',wheel,{passive:false});element.addEventListener('keydown',keydown);element.addEventListener('webglcontextlost',lost);
  const frame=now=>{if(!alive)return;const elapsed=last?Math.min((now-last)/1000,.05):0;last=now;const {params:p,playing,onMetrics,onPause}=latest.current;const key=JSON.stringify(p);if(key!==lastParams){dirty=true;lastParams=key;if(lesson.id===22){const physicsKey=JSON.stringify([p.dt,p.stiffness,p.damping]);if(physicsKey!==lastPhysics){state.sim=newSimulation();lastPhysics=physicsKey;}}const traceKey=JSON.stringify({...p,spp:undefined});if(traceKey!==lastTrace){r.sample=0;lastTrace=traceKey;}}
   if(!document.hidden){if(lesson.id===22&&playing&&!state.sim.stopped){updateSimulation(state.sim,p,elapsed);dirty=true;if(state.sim.stopped)onPause();}const trace=lesson.id===16&&playing&&r.sample<Number(p.spp);if(dirty||trace){try{renderScene(r,lesson.id,p,state);if(lesson.id===11)r.label([state.points[selected][0],state.points[selected][1]-.22],`键盘选中 P${selected}`,'mint');if(now-lastSent>120||dirty||(lesson.id===16&&r.sample>=Number(p.spp))){setLabels([...r.labels]);onMetrics({...r.stats});lastSent=now;}dirty=false;}catch(e){setError(e.message);alive=false;return;}}}
   raf=requestAnimationFrame(frame);
  };raf=requestAnimationFrame(frame);
  return()=>{alive=false;cancelAnimationFrame(raf);observer.disconnect();element.removeEventListener('pointerdown',pointerdown);element.removeEventListener('pointermove',pointermove);element.removeEventListener('pointerup',pointerup);element.removeEventListener('pointercancel',pointerup);element.removeEventListener('wheel',wheel);element.removeEventListener('keydown',keydown);element.removeEventListener('webglcontextlost',lost);r.dispose();renderer.current=null;};
 },[lesson.id,resetToken]);
 const is3D=threeD.has(lesson.id)&&!(lesson.id===10&&params.representation==='implicit');
 return <div className="canvas-stage"><canvas ref={canvas} tabIndex={0} aria-label={`${lesson.lab}，${lesson.id===11?'可拖动控制点；按 1 到 4 选择控制点，方向键移动':is3D?'可拖动改变视角，方向键调整视角':'使用右侧参数控制实验'}`} data-testid="webgl-canvas"/><div className="canvas-labels" aria-hidden="true">{labels.map((l,i)=><span key={i} className={`label-${l.color}`} style={{left:`${l.x}%`,top:`${l.y}%`}}>{l.text}</span>)}</div>{error?<div className="canvas-error" role="alert"><strong>画面暂时无法显示</strong><p>{error}</p><button onClick={()=>{setError('');latest.current.onPause();window.location.reload();}}>重新创建画面</button></div>:<div className="canvas-bottom"><span className="webgl-indicator">WebGL · 实时计算</span><span>{lesson.id===11?'拖拽控制点 · 1–4 选择 · 方向键移动':is3D&&![4,9].includes(lesson.id)?'拖拽旋转视角 · 滚轮缩放':'调节参数，观察结果'}</span></div>}</div>;
}
