export function aliasFrequency(f,fs){return Math.abs(((f+fs/2)%fs+fs)%fs-fs/2);}
export function perspectiveAttribute(t,a,b,wa,wb){return ((1-t)*a/wa+t*b/wb)/((1-t)/wa+t/wb);}
export function oscillator(method,h,steps=200){
 let x=1,v=0;const path=[[0,x,v,.5]];
 for(let i=1;i<=steps;i++){
  if(method==='explicit')[x,v]=[x+h*v,v-h*x];
  else if(method==='implicit')[x,v]=[(x+h*v)/(1+h*h),(v-h*x)/(1+h*h)];
  else if(method==='midpoint'){const xm=x+h*v/2,vm=v-h*x/2;[x,v]=[x+h*vm,v-h*xm];}
  else{v-=h*x;x+=h*v;}
  path.push([i*h,x,v,(x*x+v*v)/2]);
 }
 return path;
}
export function solveIK(x,y,l1=1,l2=1,branch=1){
 const distance=Math.hypot(x,y),reach=Math.min(l1+l2,Math.max(Math.abs(l1-l2),distance));
 const c=Math.max(-1,Math.min(1,(reach*reach-l1*l1-l2*l2)/(2*l1*l2)));
 const theta2=branch*Math.acos(c),theta1=Math.atan2(y,x)-Math.atan2(l2*Math.sin(theta2),l1+l2*Math.cos(theta2));
 const elbow=[l1*Math.cos(theta1),l1*Math.sin(theta1)];
 return {theta1,theta2,elbow,end:[elbow[0]+l2*Math.cos(theta1+theta2),elbow[1]+l2*Math.sin(theta1+theta2)],reachable:distance<=l1+l2+1e-9&&distance>=Math.abs(l1-l2)-1e-9};
}
export function loopSubdivision(vertices,faces){
 const neighbors=vertices.map(()=>new Set()),edges=new Map();
 for(const face of faces)for(let i=0;i<3;i++){
  const a=face[i],b=face[(i+1)%3],opposite=face[(i+2)%3],key=[Math.min(a,b),Math.max(a,b)].join(':');
  neighbors[a].add(b);neighbors[b].add(a);
  if(!edges.has(key))edges.set(key,{a,b,opposite:[]});edges.get(key).opposite.push(opposite);
 }
 const boundary=vertices.map(()=>[]);
 for(const e of edges.values())if(e.opposite.length===1){boundary[e.a].push(e.b);boundary[e.b].push(e.a);}
 const updated=vertices.map((p,i)=>{
  if(boundary[i].length===2)return p.map((v,j)=>.75*v+.125*(vertices[boundary[i][0]][j]+vertices[boundary[i][1]][j]));
  const n=neighbors[i].size,beta=n===3?3/16:3/(8*n);
  return p.map((v,j)=>(1-n*beta)*v+beta*[...neighbors[i]].reduce((s,k)=>s+vertices[k][j],0));
 });
 for(const e of edges.values()){
  e.index=updated.length;updated.push(vertices[e.a].map((a,j)=>e.opposite.length===2?3/8*(a+vertices[e.b][j])+1/8*(vertices[e.opposite[0]][j]+vertices[e.opposite[1]][j]):.5*(a+vertices[e.b][j])));
 }
 const index=(a,b)=>edges.get([Math.min(a,b),Math.max(a,b)].join(':')).index;
 const next=[];for(const [a,b,c] of faces){const ab=index(a,b),bc=index(b,c),ca=index(c,a);next.push([a,ab,ca],[b,bc,ab],[c,ca,bc],[ab,bc,ca]);}
 return {vertices:updated,faces:next};
}
