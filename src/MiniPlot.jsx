import React,{useEffect,useRef,useState} from 'react';
// Real WebGL line/point plot; CPU computes the educational model, GPU draws it.
export function MiniPlot({series,bounds=[-1,1,-1,1],label,preserveAspect=false}){
 const canvas=useRef(null),[error,setError]=useState('');
 useEffect(()=>{
  setError('');
  const node=canvas.current,gl=node.getContext('webgl',{alpha:false,antialias:true});
  if(!gl){setError('此设备未能创建 WebGL 上下文。下方计算结果仍可阅读。');return;}
  const program=gl.createProgram(),shaders=[];
  try{
   for(const [kind,source] of [[gl.VERTEX_SHADER,'attribute vec2 p;uniform vec4 b;void main(){gl_Position=vec4(2.0*(p.x-b.x)/(b.y-b.x)-1.0,2.0*(p.y-b.z)/(b.w-b.z)-1.0,0.,1.);gl_PointSize=7.;}'],[gl.FRAGMENT_SHADER,'precision mediump float;uniform vec3 color;void main(){gl_FragColor=vec4(color,1.);}']]){const shader=gl.createShader(kind);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));gl.attachShader(program,shader);shaders.push(shader);}
   gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
  }catch(e){shaders.forEach(s=>gl.deleteShader(s));gl.deleteProgram(program);setError(e.message);return;}
  const buffer=gl.createBuffer(),loc=gl.getAttribLocation(program,'p');
  function draw(){const r=node.getBoundingClientRect(),dpr=Math.min(devicePixelRatio,2);node.width=Math.max(2,r.width*dpr);node.height=Math.max(2,r.height*dpr);let displayBounds=bounds;if(preserveAspect){const cx=(bounds[0]+bounds[1])/2,cy=(bounds[2]+bounds[3])/2,ratio=node.width/node.height,width=Math.max(bounds[1]-bounds[0],(bounds[3]-bounds[2])*ratio),height=width/ratio;displayBounds=[cx-width/2,cx+width/2,cy-height/2,cy+height/2];}gl.viewport(0,0,node.width,node.height);gl.clearColor(.035,.054,.081,1);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);gl.uniform4fv(gl.getUniformLocation(program,'b'),displayBounds);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);for(const line of series){gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(line.points.flat()),gl.STATIC_DRAW);gl.uniform3fv(gl.getUniformLocation(program,'color'),line.color);gl.drawArrays(gl[line.mode||'LINE_STRIP'],0,line.points.length);}}
  const observer=new ResizeObserver(draw);observer.observe(node);draw();
  return()=>{observer.disconnect();gl.deleteBuffer(buffer);shaders.forEach(s=>gl.deleteShader(s));gl.deleteProgram(program);};
 },[series,bounds,preserveAspect]);
 return <div className={`mini-plot ${preserveAspect?'is-geometric':''}`}><canvas ref={canvas} role="img" aria-label={label}/>{error&&<p className="plot-error">{error}</p>}<small>{label} · WebGL</small></div>;
}
