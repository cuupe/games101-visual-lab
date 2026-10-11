import { norm,sub,cross,add,mul,TAU } from './math.js';
export const colors={purple:[.62,.58,1],mint:[.40,.88,.72],orange:[1,.64,.36],white:[.79,.84,.94],muted:[.30,.37,.48],grid:[.09,.135,.19],red:[.96,.38,.47],blue:[.35,.57,.97]};
export const vertex=(p,n,c,anchor=p)=>[...p,...n,...c,...anchor];
export function triangle(a,b,c,color,normals){const n=norm(cross(sub(b,a),sub(c,a))),anchor=mul(add(add(a,b),c),1/3);return [a,b,c].flatMap((p,i)=>vertex(p,normals?.[i]??n,color,anchor));}
const cache=new Map();
export function sphere(segments=32,flat=false,color=colors.purple){const key=`s${segments}${flat}${color}`;if(cache.has(key))return cache.get(key);let a=[];const rings=Math.max(3,Math.floor(segments/2));const point=(i,j)=>{const t=i/rings*Math.PI,p=j/segments*TAU;return [Math.sin(t)*Math.cos(p),Math.cos(t),Math.sin(t)*Math.sin(p)];};for(let i=0;i<rings;i++)for(let j=0;j<segments;j++){const p=point(i,j),q=point(i+1,j),r=point(i+1,j+1),s=point(i,j+1);if(i>0)a.push(...triangle(p,q,s,color,flat?null:[p,q,s]));if(i<rings-1)a.push(...triangle(s,q,r,color,flat?null:[s,q,r]));}const out=new Float32Array(a);cache.set(key,out);return out;}
export function cube(color=colors.purple){const key=`c${color}`;if(cache.has(key))return cache.get(key);const p=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(p=>mul(p,.7));const faces=[[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[3,7,6,2],[0,1,5,4]];const a=faces.flatMap(([a,b,c,d])=>[...triangle(p[a],p[b],p[c],color),...triangle(p[a],p[c],p[d],color)]);const out=new Float32Array(a);cache.set(key,out);return out;}
export function wireCube(color=colors.purple){const p=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(p=>mul(p,.704));const edges=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];return new Float32Array(edges.flatMap(e=>e.flatMap(i=>vertex(p[i],[0,1,0],color))));}
export function ground(size=6,color=colors.muted){return new Float32Array([...triangle([-size,-1, size],[size,-1,size],[size,-1,-size],color),...triangle([-size,-1,size],[size,-1,-size],[-size,-1,-size],color)]);}
export function checkerPlane(repeat=8){const positions=[[-2,-2,0],[2,-2,0],[-2,2,0],[-2,2,0],[2,-2,0],[2,2,0]],uv=[[0,0],[repeat,0],[0,repeat],[0,repeat],[repeat,0],[repeat,repeat]];return new Float32Array(positions.flatMap((p,i)=>vertex(p,[0,0,1],[...uv[i],0])));}
export class Batch {
 constructor(){this.lines=[];this.triangles=[];this.points=[];}
 line(a,b,color=colors.muted){this.lines.push(...vertex([...a.slice(0,2),a[2]??0],[0,0,1],color),...vertex([...b.slice(0,2),b[2]??0],[0,0,1],color));}
 polyline(points,c){for(let i=0;i<points.length-1;i++)this.line(points[i],points[i+1],c);}
 arrow(a,b,c=colors.mint){this.line(a,b,c);const d=norm(sub(a,b)),s=.10;this.line(b,[b[0]+d[0]*s-d[1]*s*.5,b[1]+d[1]*s+d[0]*s*.5,b[2]??0],c);this.line(b,[b[0]+d[0]*s+d[1]*s*.5,b[1]+d[1]*s-d[0]*s*.5,b[2]??0],c);}
 tri(a,b,c,color){this.triangles.push(...triangle([...a.slice(0,2),a[2]??0],[...b.slice(0,2),b[2]??0],[...c.slice(0,2),c[2]??0],color));}
 rect(x,y,w,h,color){this.tri([x,y],[x+w,y],[x,y+h],color);this.tri([x,y+h],[x+w,y],[x+w,y+h],color);}
 box(lo,hi,c){this.polyline([lo,[hi[0],lo[1]],hi,[lo[0],hi[1]],lo],c);}
 circle(x,y,r,color,fill=false,segments=64){let prev=[x+r,y];for(let i=1;i<=segments;i++){let p=[x+Math.cos(i/segments*TAU)*r,y+Math.sin(i/segments*TAU)*r];if(fill)this.tri([x,y],prev,p,color);else this.line(prev,p,color);prev=p;}}
 grid(extent=5,step=.5){for(let x=-extent;x<=extent;x+=step)this.line([x,-extent],[x,extent],colors.grid);for(let y=-extent;y<=extent;y+=step)this.line([-extent,y],[extent,y],colors.grid);}
}
