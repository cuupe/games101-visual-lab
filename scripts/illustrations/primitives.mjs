import {deflateSync} from 'node:zlib';
export const C={bg:'#0b1421',panel:'#142235',ink:'#e0eaf7',muted:'#9bb0ca',grid:'#2a3d55',mint:'#82dfbd',purple:'#b9a2ff',orange:'#f3b47f',blue:'#83baff',red:'#ff8c9f'};
export const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const n=value=>Number(value.toFixed(2));
export const text=(x,y,label,color=C.ink,size=17,anchor='start')=>`<text x="${n(x)}" y="${n(y)}" fill="${color}" font-size="${size}" text-anchor="${anchor}" font-family="Arial,Microsoft YaHei,sans-serif">${esc(label)}</text>`;
export const line=(x1,y1,x2,y2,color=C.grid,width=2,dash='')=>`<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${color}" stroke-width="${width}"${dash?` stroke-dasharray="${dash}"`:''}/>`;
export function arrow(x1,y1,x2,y2,color=C.mint,width=2.7){const a=Math.atan2(y2-y1,x2-x1),s=9;return line(x1,y1,x2,y2,color,width)+polygon([[x2,y2],[x2-s*Math.cos(a-.46),y2-s*Math.sin(a-.46)],[x2-s*Math.cos(a+.46),y2-s*Math.sin(a+.46)]],color,'none');}
export const rect=(x,y,w,h,fill=C.panel,stroke='none',radius=0)=>`<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${radius}" fill="${fill}" stroke="${stroke}"/>`;
export const circle=(x,y,r,fill=C.mint,stroke='none',width=2)=>`<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`;
export const polygon=(points,fill=C.panel,stroke=C.mint,width=2)=>`<polygon points="${points.map(p=>p.map(n).join(',')).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round"/>`;
export const polyline=(points,color=C.mint,width=2.5,dash='')=>`<polyline points="${points.map(p=>p.map(n).join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"${dash?` stroke-dasharray="${dash}"`:''}/>`;
export const path=(d,color=C.mint,fill='none',width=2.5,dash='')=>`<path d="${d}" fill="${fill}" stroke="${color}" stroke-width="${width}"${dash?` stroke-dasharray="${dash}"`:''}/>`;
export function grid(x=30,y=28,w=300,h=200,step=25){let out='';for(let a=x;a<=x+w;a+=step)out+=line(a,y,a,y+h,C.grid,.65);for(let b=y;b<=y+h;b+=step)out+=line(x,b,x+w,b,C.grid,.65);return out;}
export function axes(x=65,y=210,size=155){return arrow(x,y,x+size,y,C.muted,1.6)+arrow(x,y,x,y-size,C.muted,1.6)+text(x+size+8,y+5,'x',C.muted,16)+text(x-5,y-size-9,'y',C.muted,16)+text(x-16,y+20,'0',C.muted,14);}
export function label(x,y,str,color=C.mint){return circle(x,y,4,color)+text(x+8,y-9,str,color,16);}
export const project3=([x,y,z],scale=55,origin=[180,156])=>[origin[0]+scale*(x-.65*z),origin[1]-scale*(y-.35*z)];
export function box3(min,max,color=C.blue,scale=55,origin=[180,156]){const v=[];for(let i=0;i<8;i++)v.push(project3([i&1?max[0]:min[0],i&2?max[1]:min[1],i&4?max[2]:min[2]],scale,origin));let out='';for(let i=0;i<8;i++)for(const bit of [1,2,4])if(!(i&bit))out+=line(...v[i],...v[i|bit],color,2,i&4?'5 4':'');return out;}
export function cube(x=180,y=140,size=65,colors=[C.purple,C.mint,C.blue]){const a=[x,y-size],b=[x+size,y-size*.5],c=[x,y],d=[x-size,y-size*.5],e=[x+size,y+size*.5],f=[x,y+size],g=[x-size,y+size*.5];return polygon([a,b,c,d],colors[0],C.bg)+polygon([c,b,e,f],colors[1],C.bg)+polygon([d,c,f,g],colors[2],C.bg);}
export function checker(x=40,y=45,w=280,h=175,cell=20,colors=[C.mint,C.panel]){let out='';for(let row=0;row<Math.ceil(h/cell);row++)for(let col=0;col<Math.ceil(w/cell);col++)out+=rect(x+col*cell,y+row*cell,Math.min(cell,w-col*cell),Math.min(cell,h-row*cell),colors[(row+col)%2]);return out;}
export function bezier(points,t){let p=points.map(a=>[...a]);while(p.length>1)p=p.slice(0,-1).map((a,i)=>a.map((v,j)=>(1-t)*v+t*p[i+1][j]));return p[0];}
export const normalize=v=>{const l=Math.hypot(...v);return l?v.map(x=>x/l):v;};
export const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
const crcTable=Array.from({length:256},(_,i)=>{let c=i;for(let j=0;j<8;j++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
function pngChunk(type,data){const name=Buffer.from(type),payload=Buffer.concat([name,data]);let crc=0xffffffff;for(const byte of payload)crc=crcTable[(crc^byte)&255]^(crc>>>8);const size=Buffer.alloc(4),checksum=Buffer.alloc(4);size.writeUInt32BE(data.length);checksum.writeUInt32BE((crc^0xffffffff)>>>0);return Buffer.concat([size,payload,checksum]);}
export function sphere(cx=180,cy=125,r=78,{light=[-.5,.7,1],mode='diffuse',shininess=32,albedo=[.35,.64,.9],ambient=.07}={}){
 const l=normalize(light),h=normalize([l[0],l[1],l[2]+1]),size=320,stride=1+size*4,raw=Buffer.alloc(stride*size);
 const encode=v=>v<=.0031308?12.92*v:1.055*Math.pow(v,1/2.4)-.055;
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const nx=2*(x+.5)/size-1,ny=1-2*(y+.5)/size,z2=1-nx*nx-ny*ny;if(z2<0)continue;const normal=[nx,ny,Math.sqrt(z2)];let color;
  if(mode==='normal')color=normal.map(v=>.5+.5*v);
  else{const diffuse=Math.max(0,dot(normal,l)),spec=mode==='specular'?Math.pow(Math.max(0,dot(normal,h)),shininess):0;color=albedo.map(v=>encode(Math.min(1,Math.max(0,ambient+v*diffuse+.85*spec))));}
  const offset=y*stride+1+x*4;color.forEach((v,i)=>raw[offset+i]=Math.round(Math.min(1,Math.max(0,v))*255));raw[offset+3]=255;
 }
 const header=Buffer.alloc(13);header.writeUInt32BE(size,0);header.writeUInt32BE(size,4);header[8]=8;header[9]=6;
 const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),pngChunk('IHDR',header),pngChunk('IDAT',deflateSync(raw,{level:9})),pngChunk('IEND',Buffer.alloc(0))]);
 return '<image x="'+(cx-r)+'" y="'+(cy-r)+'" width="'+r*2+'" height="'+r*2+'" href="data:image/png;base64,'+png.toString('base64')+'"/>';
}
export function bars(values,x=40,y=210,w=280,h=155,color=C.mint){let out='';const max=Math.max(...values,1),s=w/values.length;values.forEach((v,i)=>out+=rect(x+i*s+2,y-h*v/max,s-4,h*v/max,Array.isArray(color)?color[i%color.length]:color));return out+line(x,y,x+w,y,C.muted,1.4);}
export function spark(values,{x=35,y=205,w=285,h=150,min=0,max=1,color=C.mint}={}){const range=max-min||1;return polyline(values.map((v,i)=>[x+i*w/(values.length-1),y-h*(v-min)/range]),color);}
export const panel=(title,caption,svg)=>({title,caption,svg});
export const group=(focus,...panels)=>({focus,panels});
export function wrap(svg,title,caption){return `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="264" viewBox="0 0 360 264" role="img"><title>${esc(title)}</title><desc>${esc(caption)}</desc><rect width="360" height="264" fill="${C.bg}"/>${svg}</svg>`;}
