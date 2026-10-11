export const TAU = 2 * Math.PI;
export const rad = x => x * Math.PI / 180;
export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export const add = (a,b) => a.map((x,i)=>x+b[i]);
export const sub = (a,b) => a.map((x,i)=>x-b[i]);
export const mul = (a,s) => a.map(x=>x*s);
export const dot = (a,b) => a.reduce((s,x,i)=>s+x*b[i],0);
export const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const norm = a => mul(a,1/(Math.hypot(...a)||1));
export const lerp = (a,b,t) => a.map((x,i)=>x*(1-t)+b[i]*t);
export const identity = () => [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
export function matmul(a,b){const r=Array(16).fill(0);for(let c=0;c<4;c++)for(let row=0;row<4;row++)for(let k=0;k<4;k++)r[c*4+row]+=a[k*4+row]*b[c*4+k];return r;}
export const translation = (x=0,y=0,z=0) => [1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1];
export const scaling = (s=1) => [s,0,0,0,0,s,0,0,0,0,s,0,0,0,0,1];
export const rotateZ = t => {const c=Math.cos(t),s=Math.sin(t);return [c,s,0,0,-s,c,0,0,0,0,1,0,0,0,0,1];};
export const rotateY = t => {const c=Math.cos(t),s=Math.sin(t);return [c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1];};
export function transform(m,v){return Array.from({length:4},(_,r)=>m[r]*v[0]+m[4+r]*v[1]+m[8+r]*v[2]+m[12+r]*(v[3]??1));}
export function perspective(fov,aspect,near=.1,far=100){const f=1/Math.tan(fov/2);return [f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0];}
export function ortho(l,r,b,t,n=.1,f=100){return [2/(r-l),0,0,0,0,2/(t-b),0,0,0,0,-2/(f-n),0,-(r+l)/(r-l),-(t+b)/(t-b),-(f+n)/(f-n),1];}
export function lookAt(eye,target,up=[0,1,0]){const z=norm(sub(eye,target)),x=norm(cross(up,z)),y=cross(z,x);return [x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1];}
export function barycentric(p,a,b,c){const den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);if(Math.abs(den)<1e-10)return [-1,-1,-1];const u=((b[1]-c[1])*(p[0]-c[0])+(c[0]-b[0])*(p[1]-c[1]))/den;const v=((c[1]-a[1])*(p[0]-c[0])+(a[0]-c[0])*(p[1]-c[1]))/den;return [u,v,1-u-v];}
export const insideTriangle = (p,a,b,c) => barycentric(p,a,b,c).every(x=>x>=-1e-8);
export function bezier(points,t){let levels=[points];while(levels.at(-1).length>1){const prev=levels.at(-1);levels.push(prev.slice(0,-1).map((p,i)=>lerp(p,prev[i+1],t)));}return {point:levels.at(-1)[0],levels};}
export function raySphere(o,d,c,r){const oc=sub(o,c),a=dot(d,d),b=2*dot(oc,d),cc=dot(oc,oc)-r*r,disc=b*b-4*a*cc;if(disc<0)return {disc,hits:[]};return {disc,hits:[(-b-Math.sqrt(disc))/(2*a),(-b+Math.sqrt(disc))/(2*a)].filter(t=>t>=0)};}
export function rayBox(o,d,lo,hi){let near=0,far=Infinity;for(let i=0;i<o.length;i++){if(Math.abs(d[i])<1e-9){if(o[i]<lo[i]||o[i]>hi[i])return null;continue;}let t0=(lo[i]-o[i])/d[i],t1=(hi[i]-o[i])/d[i];if(t0>t1)[t0,t1]=[t1,t0];near=Math.max(near,t0);far=Math.min(far,t1);if(near>far)return null;}return [near,far];}
export const schlick = (cosine,f0=.04) => f0+(1-f0)*(1-clamp(cosine,0,1))**5;
export const linearToSrgb = x => x<=.0031308?12.92*x:1.055*x**(1/2.4)-.055;
export const srgbToLinear = x => x<=.04045?x/12.92:((x+.055)/1.055)**2.4;
export function springStep(x,v,dt,k,damping,method='symplectic'){const a=-k*x-damping*v;return method==='explicit'?[x+v*dt,v+a*dt]:[x+(v+a*dt)*dt,v+a*dt];}
export function refract2(theta,n1,n2){const s=n1/n2*Math.sin(theta);return Math.abs(s)>1?null:Math.asin(s);}
export function lensImage(f,u){return Math.abs(u-f)<1e-8?Infinity:f*u/(u-f);}
