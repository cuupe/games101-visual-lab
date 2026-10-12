import {C,text,line,arrow,rect,circle,polygon,polyline,path,grid,axes,label,project3,box3,cube,checker,bezier,normalize,dot,sphere,bars,spark,panel,group} from './primitives.mjs';

// These are independently drawn teaching diagrams, not images from the lecture slides.
const foot=(s,color=C.mint)=>text(180,246,s,color,17,'middle');
const p=(title,caption,svg,conclusion)=>panel(title,caption,svg+foot(conclusion));
const fmt=(v,n=2)=>Number(v.toFixed(n)).toString();
const triangle=[[65,205],[300,205],[140,48]];
const mix=(a,b,t)=>a.map((v,i)=>(1-t)*v+t*b[i]);
const gray=v=>'#'+Array(3).fill(Math.round(Math.max(0,Math.min(1,v))*255).toString(16).padStart(2,'0')).join('');
const depthAxes=()=>arrow(40,40,40,207,C.muted,1.5)+arrow(40,210,325,210,C.muted,1.5)+text(52,35,'z：下方更远',C.muted,16)+text(320,229,'屏幕 x',C.muted,16,'end');
function wave(f,{color=C.mint,amp=62,offset=130,samples=0,phase=0}={}){
 let out=line(30,offset,330,offset,C.grid,1)+polyline(Array.from({length:301},(_,i)=>[30+i,offset-amp*Math.cos(2*Math.PI*f*i/300+phase)]),color,2.3);
 for(let i=0;i<=samples&&samples;i++)out+=circle(30+300*i/samples,offset-amp*Math.cos(2*Math.PI*f*i/samples+phase),4,C.orange)+line(30+300*i/samples,offset+75,30+300*i/samples,offset+80,C.muted,1);
 return out+text(30,224,'0 s',C.muted,16)+text(330,224,'1 s',C.muted,16,'end');
}
function spectrum(fs,band){
 const origin=180,scale=14,base=196;let out=arrow(20,base,337,base,C.muted,1.5);
 for(const k of [-1,0,1]){const c=origin+k*fs*scale;out+=polygon([[c-band*scale,base],[c,70],[c+band*scale,base]],k?C.purple+'66':C.mint+'66',k?C.purple:C.mint,2);out+=text(c,219,String(k*fs),k?C.purple:C.mint,16,'middle');}
 return out+text(25,40,'频谱支撑：−B 到 +B',C.ink,17)+text(324,42,'f',C.muted,17);
}
function coverage(n){
 let out=rect(75,40,180,180,C.panel,C.muted)+polygon([[75,220],[75,40],[212,220]],C.mint+'55',C.mint,2),inside=0;
 for(let j=0;j<n;j++)for(let i=0;i<n;i++){const x=75+(i+.5)*180/n,y=40+(j+.5)*180/n,on=x<=75+137*(y-40)/180;inside+=on?1:0;out+=circle(x,y,Math.min(7,25/n),on?C.mint:C.red);}
 return {svg:out+text(283,106,'绿：内',C.mint,16)+text(283,139,'红：外',C.red,16),inside,total:n*n};
}
function disk({light=[0,0,1],ambient=0,shininess=32,mode='diffuse'}={}){
 return sphere(180,125,76,{light,ambient,shininess,mode})+text(180,29,'同一球体、同一材质',C.muted,17,'middle');
}
function localVectors(blocked=false){
 let out=line(45,192,315,192,C.muted,3)+circle(168,192,5,C.ink)+arrow(168,192,168,75,C.blue)+text(152,68,'n',C.blue,18)+arrow(168,192,276,78,C.orange)+text(281,75,'l',C.orange,18)+arrow(168,192,310,165,C.purple)+text(313,155,'v',C.purple,18);
 if(blocked)out+=rect(207,116,45,18,C.red)+text(217,108,'遮挡',C.red,16);
 return out;
}
function depthStep(selected,values=[.7,.3,.5]){
 let out=text(26,32,'较小的深度更近',C.muted,17);values.forEach((z,i)=>{out+=rect(45,58+i*51,200,36,[C.red,C.mint,C.blue][i]+'44')+text(57,82+i*51,`${['红','绿','蓝'][i]}：z = ${z}`,[C.red,C.mint,C.blue][i],18);if(i===selected)out+=rect(270,58+i*51,40,36,[C.red,C.mint,C.blue][i])+text(265,47,'保留',C.ink,16);});return out;
}
function phongMesh(mode){
 const vertices=[[0,0,1]],faces=[],count=8;
 for(const r of [.52,1])for(let i=0;i<count;i++){const a=2*Math.PI*i/count;vertices.push([r*Math.cos(a),r*Math.sin(a),Math.sqrt(1-r*r)]);}
 for(let i=0;i<count;i++){const j=(i+1)%count;faces.push([0,1+i,1+j]);faces.push([1+i,9+i,9+j],[1+i,9+j,1+j]);}
 const l=normalize([-.4,.65,1]),h=normalize([l[0],l[1],l[2]+1]);
 const shade=n=>Math.min(1,.04+.65*Math.max(0,dot(n,l))+.85*Math.pow(Math.max(0,dot(n,h)),48));
 let out='';for(const face of faces){const v=face.map(i=>vertices[i]),screen=v.map(a=>[180+80*a[0],127-80*a[1]]),a=v[1].map((x,i)=>x-v[0][i]),b=v[2].map((x,i)=>x-v[0][i]);let fn=normalize([a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]);if(fn[2]<0)fn=fn.map(x=>-x);
  const denominator=(screen[1][1]-screen[2][1])*(screen[0][0]-screen[2][0])+(screen[2][0]-screen[1][0])*(screen[0][1]-screen[2][1]);
  for(let y=45;y<209;y+=3)for(let x=97;x<264;x+=3){const px=x+1.5,py=y+1.5,w0=((screen[1][1]-screen[2][1])*(px-screen[2][0])+(screen[2][0]-screen[1][0])*(py-screen[2][1]))/denominator,w1=((screen[2][1]-screen[0][1])*(px-screen[2][0])+(screen[0][0]-screen[2][0])*(py-screen[2][1]))/denominator,w2=1-w0-w1;if(Math.min(w0,w1,w2)<0)continue;const w=[w0,w1,w2],value=mode==='flat'?shade(fn):mode==='gouraud'?v.reduce((s,n,i)=>s+w[i]*shade(n),0):shade(normalize([0,1,2].map(j=>v.reduce((s,n,i)=>s+w[i]*n[j],0))));out+=rect(x,y,3.15,3.15,'#'+[.42,.72,1].map(c=>Math.round(Math.pow(value*c,1/2.2)*255).toString(16).padStart(2,'0')).join(''));}
 }
 for(const f of faces)out+=polygon(f.map(i=>[180+80*vertices[i][0],127-80*vertices[i][1]]),'none',C.ink+'55',.65);
 return out+text(180,30,'相同网格与 Blinn–Phong 模型',C.muted,16,'middle');
}
function bilinear(u,v){return (1-u)*(1-v)*0+u*(1-v)*1+(1-u)*v*1+u*v*0;}
function uvQuad(repeat=false){
 const a=[58,194],b=[298,194],c=[254,60],d=[96,60],cells=8;let out='';for(let j=0;j<cells;j++)for(let i=0;i<cells;i++){const at=(u,v)=>mix(mix(a,b,u),mix(d,c,u),v);out+=polygon([at(i/cells,j/cells),at((i+1)/cells,j/cells),at((i+1)/cells,(j+1)/cells),at(i/cells,(j+1)/cells)],(i+j)%2?C.panel:C.mint,C.bg,.4);}
 return out+text(42,215,'(0,0)',C.blue,16)+text(275,215,'(1,0)',C.blue,16)+text(250,47,'(1,1)',C.blue,16)+text(51,47,'(0,1)',C.blue,16);
}
function baryPoint(weights){return [0,1].map(j=>triangle.reduce((s,v,i)=>s+weights[i]*v[j],0));}
function baryDiagram(weights){const q=baryPoint(weights);return polygon(triangle,C.panel,C.muted)+polygon([q,triangle[1],triangle[2]],C.red+'66',C.red)+polygon([q,triangle[2],triangle[0]],C.mint+'66',C.mint)+polygon([q,triangle[0],triangle[1]],C.blue+'66',C.blue)+circle(...q,5,C.ink)+text(45,219,'A',C.red,18)+text(306,219,'B',C.mint,18)+text(135,35,'C',C.blue,18)+text(q[0]+8,q[1]-6,'P',C.ink,16);}
function curve(points,color=C.mint,width=3){return polyline(Array.from({length:101},(_,i)=>bezier(points,i/100)),color,width);}
const control=[[45,185],[75,45],[280,45],[315,185]];
function casteljau(t){let out=polyline(control,C.muted,1.8,'5 4')+curve(control),q=control;control.forEach((v,i)=>out+=label(...v,`P${i}`,C.muted));for(let level=0;q.length>1;level++){q=q.slice(0,-1).map((a,i)=>mix(a,q[i+1],t));out+=polyline(q,[C.blue,C.purple,C.orange][level],2);q.forEach(v=>out+=circle(...v,4,[C.blue,C.purple,C.orange][level]));}return out+circle(...q[0],7,C.orange)+text(q[0][0]+10,q[0][1]+22,'B(t)',C.orange,16);}
function bernstein(t){return [(1-t)**3,3*t*(1-t)**2,3*t*t*(1-t),t**3];}
function continuity(kind){const left=[[30,175],[60,70],[135,130],[180,130]],right=[[180,130],kind==='C0'?[215,88]:kind==='G1'?[270,130]:[225,130],[288,190],[327,82]];return curve(left,C.blue)+curve(right,C.mint)+circle(180,130,5,C.orange)+arrow(135,130,180,130,C.blue,2.5)+arrow(180,130,...right[1],C.mint,2.5)+text(39,45,'前段',C.blue,17)+text(273,45,'后段',C.mint,17)+text(180,212,'共同端点',C.orange,17,'middle');}
const surfaceControl=Array.from({length:4},(_,i)=>Array.from({length:4},(_,j)=>[i,1.3*Math.sin(Math.PI*i/3)*Math.sin(Math.PI*j/3),j]));
const surfacePoint=(u,v)=>bezier(surfaceControl.map(row=>bezier(row,u)),v);
const surfaceScreen=v=>project3(v,49,[155,166]);
function surface(mode){let out='';const count=mode==='mesh'?9:4;if(mode==='control'){for(const row of surfaceControl)out+=polyline(row.map(surfaceScreen),C.muted,1.6);for(let j=0;j<4;j++)out+=polyline(surfaceControl.map(row=>surfaceScreen(row[j])),C.muted,1.6);surfaceControl.flat().forEach(v=>out+=circle(...surfaceScreen(v),4,C.purple));}
 else if(mode==='construction'){for(const row of surfaceControl)out+=polyline(row.map(surfaceScreen),C.grid,1);const q=surfaceControl.map(row=>bezier(row,.5));q.forEach(v=>out+=circle(...surfaceScreen(v),5,C.blue));out+=curve(q.map(surfaceScreen),C.blue)+circle(...surfaceScreen(surfacePoint(.5,.5)),7,C.orange)+text(180,31,'固定 u = 0.5，再改变 v',C.ink,17,'middle');}
 else{for(let i=0;i<count;i++)for(let j=0;j<count;j++){const q=[[i/count,j/count],[(i+1)/count,j/count],[(i+1)/count,(j+1)/count],[i/count,(j+1)/count]].map(([u,v])=>surfaceScreen(surfacePoint(u,v)));out+=polygon(q,C.mint+'44',C.mint,1);}const q=surfacePoint(.5,.5),su=surfacePoint(.51,.5).map((x,i)=>x-q[i]),sv=surfacePoint(.5,.51).map((x,i)=>x-q[i]);let n=normalize([su[1]*sv[2]-su[2]*sv[1],su[2]*sv[0]-su[0]*sv[2],su[0]*sv[1]-su[1]*sv[0]]);if(n[1]<0)n=n.map(x=>-x);out+=arrow(...surfaceScreen(q),...surfaceScreen(q.map((x,i)=>x+n[i])),C.orange)+text(165,65,'n',C.orange,18);}
 return out;
}

export const rasterGeometryVisuals={
 6:[
  group('橙色采样点相同，是否足以确定原信号？',
   p('真实信号：7 Hz','绿色曲线在一秒内振荡 7 次；橙点只记录每秒 10 个时刻。',wave(7,{samples:10})+text(32,34,'真实：7 Hz',C.mint,18),'fs = 10 Hz，Nyquist = 5 Hz'),
   p('混叠信号：3 Hz','紫色 3 Hz 余弦在相同采样时刻与上图完全一致。',wave(3,{samples:10,color:C.purple})+text(32,34,'错误低频：3 Hz',C.purple,18),'cos(7×2πn/10) = cos(3×2πn/10)'),
   p('时间混叠：车轮倒转','每帧实际向前转 315°，与向后转 45°具有相同的可见朝向。',circle(180,127,76,'none',C.muted)+Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return line(180,127,180+72*Math.cos(a),127+72*Math.sin(a),C.grid,2);}).join('')+arrow(180,127,252,127,C.mint,4)+arrow(180,127,231,76,C.orange,4)+path('M 273 124 A 93 93 0 1 1 246 61',C.mint,'none',2,'5 4')+text(26,33,'前进 315° ≡ 后退 45°',C.ink,17),'时间采样也会丢失旋转方向')),
  group('保留低频、移除高频，会怎样改变信号的细节？',
   p('两个频率组成一个信号','曲线按明确的公式生成：1 Hz 余弦叠加幅度 0.35 的 5 Hz 余弦。',line(30,130,330,130,C.grid)+polyline(Array.from({length:301},(_,i)=>[30+i,130-55*(Math.cos(2*Math.PI*i/300)+.35*Math.cos(10*Math.PI*i/300))]),C.mint)+text(34,34,'1 Hz + 0.35 × 5 Hz',C.ink,17),'细小起伏来自 5 Hz 分量'),
   p('换成频率坐标','两根柱分别表示两个余弦分量的幅度；图中省略对称的负频率。',bars([1,.35],70,203,220,135,[C.mint,C.purple])+text(126,225,'1 Hz',C.mint,17,'middle')+text(235,225,'5 Hz',C.purple,17,'middle')+text(125,56,'1',C.mint,18,'middle')+text(235,145,'0.35',C.purple,18,'middle'),'频谱描述同一信号的另一组坐标'),
   p('理想低通后的变化','设截止频率为 2 Hz；绿色只保留 1 Hz，虚线仍显示未滤波的输入。',polyline(Array.from({length:301},(_,i)=>[30+i,130-55*(Math.cos(2*Math.PI*i/300)+.35*Math.cos(10*Math.PI*i/300))]),C.muted,1.5,'4 4')+wave(1,{amp:55})+text(33,34,'截止频率 2 Hz',C.mint,18),'轮廓变平滑，因为高频被移除')),
  group('一个归一化卷积核怎样同时解释局部平均和频率衰减？',
   p('离散卷积核','三次邻域采样按 1/4、1/2、1/4 加权，权重总和为 1。',bars([.25,.5,.25],45,195,270,140,[C.blue,C.mint,C.blue])+text(90,222,'−1',C.muted,17,'middle')+text(180,222,'0',C.muted,17,'middle')+text(270,222,'+1',C.muted,17,'middle')+text(90,148,'1/4',C.blue,18,'middle')+text(180,113,'1/2',C.mint,18,'middle')+text(270,148,'1/4',C.blue,18,'middle'),'常量 1 滤波后仍为 1'),
   p('边缘附近的局部平均','窗口内的三个值是 0、1、1；加权后得到 0.75，边缘形成中间亮度。',rect(40,74,85,80,gray(0),C.muted)+rect(125,74,85,80,gray(1),C.muted)+rect(210,74,85,80,gray(1),C.muted)+text(82,183,'0×1/4',C.blue,16,'middle')+text(168,183,'1×1/2',C.mint,16,'middle')+text(253,183,'1×1/4',C.blue,16,'middle')+rect(148,195,48,31,gray(.75))+text(179,42,'窗口覆盖黑白交界',C.ink,17,'middle'),'0 + 0.5 + 0.25 = 0.75'),
   p('相同核的频率响应','这个核的响应为 cos²(πf)；横轴是每个样本中的周期数。',arrow(35,203,325,203,C.muted,1.5)+arrow(35,203,35,45,C.muted,1.5)+polyline(Array.from({length:101},(_,i)=>[35+280*i/100,203-140*Math.cos(Math.PI*i/200)**2]),C.mint)+text(27,225,'0',C.muted,16)+text(168,225,'0.25',C.muted,16,'middle')+text(310,225,'0.5',C.muted,16,'middle')+text(42,42,'响应',C.ink,17),'高频比低频衰减更多')),
  group('提高采样频率与先限带，哪种方式能避免频谱重叠？',
   p('采样率太低','原频谱半宽 B=3 Hz，副本间隔 fs=5 Hz；邻近支撑区互相重叠。',spectrum(5,3),'fs = 5 < 2B = 6，出现混叠'),
   p('提高采样频率','原频谱仍为 B=3 Hz，但副本间隔增大到 8 Hz。',spectrum(8,3),'fs = 8 > 6，副本不再重叠'),
   p('采样前限制带宽','保持 fs=5 Hz，先把频谱半宽收窄为 B=2 Hz。',spectrum(5,2),'先低通：fs = 5 > 2B = 4')),
  group('同样是求平均，为什么滤波必须在丢失信息之前进行？',
   p('中心样本只回答一点','绿色三角区域只覆盖部分像素，中心样本落在外部，因此得到 0。',coverage(1).svg,'单点判断：0，不代表面积为 0'),
   p('像素区域有部分覆盖','对图中的直角三角形精确求面积，137×180/2 除以 180²。',rect(75,40,180,180,C.panel,C.muted)+polygon([[75,220],[75,40],[212,220]],C.mint+'99',C.mint)+text(270,92,'高 180',C.muted,16)+text(99,33,'底 137',C.muted,16),'真实覆盖率 = 137/360 ≈ 0.381'),
   p('事后模糊无法辨别原信号','黑白细条纹在固定相位上全部采到白色；对白色样本求平均仍得到白色。',checker(32,52,296,94,18,[C.ink,C.bg])+Array.from({length:8},(_,i)=>circle(41+36*i,99,5,C.orange)).join('')+arrow(180,152,180,175,C.orange)+rect(54,180,252,37,C.ink)+text(30,31,'全部中心样本落在白条纹',C.ink,16),'后滤波仍为 1；区域均值为 0.5')),
  group('样本数增加以后，可表示的覆盖率和运算量怎样变化？',
   ...[1,2,4].map(n=>{const d=coverage(n);return p(`${n*n} 个子样本`,`绿点在三角形内、红点在外；本图 ${d.inside} 个绿点除以 ${d.total} 个样本。`,d.svg,`${d.inside}/${d.total} = ${fmt(d.inside/d.total,4)}；真实值 ≈ 0.381`); })),
  group('哪种方法增加真实样本，哪种只修改已有图像？',
   p('FXAA：局部后处理','示意阶梯边经过局部平滑；方法读取已有像素，不会重新查询几何。',Array.from({length:6},(_,i)=>rect(38+i*25,70+i*16,25,145-i*16,C.mint)).join('')+arrow(202,140,230,140,C.orange)+path('M 246 215 L 246 146 Q 267 123 281 101 Q 296 84 323 71 L 323 215 Z',C.mint,C.mint+'88',2)+text(32,34,'已有像素 → 检测边缘',C.ink,17),'减少锯齿，但可能丢失清晰细节'),
   p('TAA：跨帧抖动采样','四个时间帧把采样位置移到同一像素中的不同子位置。',rect(87,40,180,180,C.panel,C.muted)+[[132,85],[222,85],[132,175],[222,175]].map((q,i)=>circle(...q,7,[C.blue,C.mint,C.purple,C.orange][i])+text(q[0]+13,q[1]+5,`帧 ${i+1}`,[C.blue,C.mint,C.purple,C.orange][i],16)).join(''),'累积多个时刻的真实采样信息'),
   p('历史失效：新露出的背景','紫色虚线是历史物体位置，绿色是当前位置；旧位置已变成背景，不能继续直接混合。',rect(32,55,296,157,C.panel)+rect(77,78,75,103,'none',C.purple)+line(77,78,152,78,C.purple,2,'5 4')+rect(172,78,75,103,C.mint)+arrow(130,42,210,42,C.orange)+text(35,202,'新露背景',C.purple,16)+text(183,202,'当前物体',C.mint,16),'运动重投影需要检测历史有效性'))
 ],
 7:[
  group('同一对表面的前后顺序会不会随屏幕位置变化？',
   p('左侧：红色更近','深度剖面中红线从左到右变远，蓝线变近；左侧红线深度较小。',depthAxes()+line(58,68,300,185,C.red,4)+line(58,185,300,68,C.blue,4)+line(90,55,90,200,C.orange,2,'5 4')+text(112,95,'红更近',C.red,18),'左侧需要先蓝后红'),
   p('右侧：蓝色更近','两条深度曲线相交后，右侧蓝线深度较小，排序与左侧相反。',depthAxes()+line(58,68,300,185,C.red,4)+line(58,185,300,68,C.blue,4)+line(270,55,270,200,C.orange,2,'5 4')+text(174,91,'蓝更近',C.blue,18),'右侧需要先红后蓝'),
   p('没有统一的图元顺序','正确结果在交点左侧显示红、右侧显示蓝。把整块红或整块蓝画在最后都不正确。',rect(40,65,140,130,C.red)+rect(180,65,140,130,C.blue)+line(180,55,180,205,C.orange,2,'5 4')+text(110,41,'红更近',C.red,18,'middle')+text(250,41,'蓝更近',C.blue,18,'middle'),'需要逐采样位置判断可见性')),
  group('按任何顺序提交这三个片元，最终颜色会是什么？',
   p('第一步：初始化后接收红色','初始深度无穷大，因此红色 0.7 通过并写入颜色与深度。',depthStep(0),'0.7 < ∞，缓冲深度变为 0.7'),
   p('第二步：绿色更近','绿色深度 0.3 小于缓冲中的 0.7，因此替换红色。',depthStep(1),'0.3 < 0.7，缓冲深度变为 0.3'),
   p('第三步：拒绝蓝色','蓝色深度 0.5 大于已有的 0.3，颜色与深度都保持不变。',depthStep(1)+text(270,183,'拒绝',C.red,16),'最终绿色；保留最近的 z = 0.3')),
  group('法线与光方向相同，能否保证表面真的受到光照？',
   p('局部着色需要三个方向','蓝色 n 是表面法线，橙色 l 指向光源，紫色 v 指向观察者。',localVectors(),'所有向量必须处于同一坐标空间'),
   p('局部公式看不到挡板','橙色光方向依然朝向表面，但红色挡板遮住了从光源到表面的路径。',localVectors(true),'n·l 为正，光源仍可能不可见'),
   p('另一次可见性查询','先沿光源路径检查遮挡，只有光源可见时才加入对应直接光照贡献。',localVectors(true)+text(39,32,'可见性 V = 0',C.red,18)+text(39,56,'直接光：V × L = 0',C.red,17),'shading 计算颜色，shadow 查询光路')),
  group('球心正对相机处的法线固定，转动光源会怎样改变漫反射？',
   p('正入射：θ = 0°','光方向为 (0,0,1)，球心表面法线也为 (0,0,1)，余弦项为 1。',disk({light:[0,0,1]})+circle(180,125,4,C.orange),'球心 max(0,n·l) = 1'),
   p('斜入射：θ = 60°','光方向改为 (√3/2,0,1/2)，球心余弦项降为 0.5；右侧更朝向光。',disk({light:[Math.sqrt(3)/2,0,.5]})+circle(180,125,4,C.orange),'球心 max(0,n·l) = 0.5'),
   p('掠射：θ = 90°','光沿右侧水平入射，球心法线与光方向垂直，因此球心为黑而右侧受光。',disk({light:[1,0,0]})+circle(180,125,4,C.orange),'球心 max(0,n·l) = 0')),
  group('同样功率穿过更大的球面，单位面积分到多少？',
   ...[1,2,3].map(r=>p(`距点光源 r = ${r}`,`光源功率不变；此图圆半径与距离成比例，球面面积随 r² 增长。`,circle(180,121,r*29,'none',C.blue,2)+circle(180,121,9,C.orange)+arrow(180,121,180+r*29,121,C.mint)+text(180+r*14.5,111,`r=${r}`,C.mint,17,'middle')+text(180,33,`相对球面面积：${r*r}`,C.ink,17,'middle'),`照度比例 = 1/${r*r} = ${fmt(1/(r*r),3)}`))),
  group('点积偏大或颜色求和偏亮，该怎样定位数值错误？',
   p('未归一化：点积不等于余弦','蓝色法线长度 2，橙色光方向长度 1；二者同向，但点积为 2。',arrow(110,208,110,55,C.blue,4)+arrow(220,208,220,132,C.orange,4)+text(67,40,'|n| = 2',C.blue,18)+text(202,119,'|l| = 1',C.orange,18),'错误：n·l = 2 > 1'),
   p('先统一空间，再归一化','两根同向单位向量长度均为 1，点积才能表示夹角余弦。',arrow(110,208,110,96,C.blue,4)+arrow(220,208,220,96,C.orange,4)+text(63,75,'单位法线',C.blue,18)+text(191,75,'单位光向',C.orange,18),'正确：normalize(n)·l = 1'),
   p('在线性空间叠加能量','两份线性亮度 0.25 相加得到 0.5；显示编码在求和完成后执行。',rect(30,73,85,86,gray(.537))+text(72,189,'线性 .25',C.muted,16,'middle')+text(130,123,'+',C.ink,22,'middle')+rect(147,73,85,86,gray(.537))+text(189,189,'线性 .25',C.muted,16,'middle')+text(248,123,'=',C.ink,22,'middle')+rect(269,73,67,86,gray(.735))+text(302,189,'.50',C.mint,17,'middle'),'线性相加后编码：0.5 → sRGB 0.735'))
 ],
 8:[
  group('半程向量与法线一致时，为什么高光最强？',
   p('半程向量平分两个方向','光与观察方向各偏离法线 45°；相加再归一化，半程向量恰好与 n 同向。',line(40,203,320,203,C.muted,2)+arrow(180,203,90,113,C.orange)+arrow(180,203,270,113,C.purple)+arrow(180,203,180,73,C.mint)+text(79,97,'l',C.orange,18)+text(277,97,'v',C.purple,18)+text(171,56,'h = n',C.mint,18),'n·h = 1，高光项达到最大'),
   p('指数 p = 8：较宽高光','与下一图使用相同球体、光源和材质；低指数让偏离半程方向的点仍贡献明显。',disk({mode:'specular',shininess:8,light:[-.5,.7,1]}),'0.9⁸ ≈ 0.430'),
   p('指数 p = 64：较窄高光','高指数保留更接近 n·h=1 的区域；它改变波瓣宽度，并不自动保证能量守恒。',disk({mode:'specular',shininess:64,light:[-.5,.7,1]}),'0.9⁶⁴ ≈ 0.00118')),
  group('增大环境项能填亮暗面，但它能生成遮挡或真实间接光吗？',
   ...[0,.15,.7].map(a=>p(`环境项 ka = ${a}`,`球体与光源不变，给所有表面叠加常量 ${a}；${a===0?'未接收直接光的区域保持黑色':'背光区域也被填亮'}。`,disk({ambient:a,light:[-.7,.3,.8]})+text(180,216,'仅增加统一常量',C.muted,16,'middle'),a===0?'背光区域为黑':a===.15?'填亮暗面，不包含光源可见性':'过大常量掩盖了形状明暗'))),
  group('固定同一个模型和网格，仅改变着色发生的位置，会得到什么？',
   p('逐面：Flat shading','每个面使用一个几何面法线，整面只计算一个颜色；折面和高光都呈块状。',phongMesh('flat'),'每个三角形共享一次着色结果'),
   p('逐顶点：Gouraud shading','顶点执行同一个 Blinn–Phong 模型，片元只插值颜色；窄高光可能落在顶点之间。',phongMesh('gouraud'),'插值颜色，不重新求局部高光'),
   p('逐片元：Phong shading','先插值顶点法线并归一化，再逐片元执行相同模型；高光能在顶点之间出现。',phongMesh('phong'),'插值法线后重新计算光照')),
  group('顶点法线、面法线和法线的长度，各自影响什么？',
   p('硬边需要两套法线','两个相邻表面共享几何位置，但硬边两侧分别采用不同法线，不能只存一根平滑法线。',polygon([[70,181],[178,123],[178,47],[70,104]],C.blue+'77',C.blue)+polygon([[178,123],[285,181],[285,104],[178,47]],C.mint+'77',C.mint)+arrow(125,120,80,73,C.blue)+arrow(232,120,282,73,C.mint)+text(44,211,'面 A 的法线',C.blue,17)+text(218,211,'面 B 的法线',C.mint,17),'同一位置可有独立的法线索引'),
   p('插值之后必须归一化','两个正交单位法线的平均为 (0.5,0.5)，长度仅为 √0.5；绿色把它重新单位化。',arrow(70,204,240,204,C.blue)+arrow(70,204,70,34,C.purple)+arrow(70,204,155,119,C.orange,4)+arrow(70,204,190,84,C.mint,3)+text(179,137,'原平均',C.orange,16)+text(191,73,'单位化',C.mint,16),'(0.5,0.5) → (0.707,0.707)'),
   p('把法线直接显示为颜色','颜色编码三个法线分量：红为 x，绿为 y，蓝为 z；这个视图不计算入射光。',sphere(180,125,78,{mode:'normal'})+text(180,31,'RGB ← 0.5n + 0.5',C.ink,18,'middle'),'法线调试能直接暴露方向错误')),
  group('一帧中哪些阶段处理顶点，哪些阶段处理采样点？',
   p('顶点阶段：坐标变换','顶点输入经过 MVP，得到裁剪坐标；透视除法与视口变换后才落到屏幕。',cube(85,105,39)+arrow(132,106,176,106,C.orange)+polygon([[205,184],[327,184],[246,69]],C.mint+'44',C.mint)+text(35,184,'模型坐标',C.purple,17)+text(178,214,'屏幕顶点',C.mint,17),'顶点着色器不直接决定所有像素'),
   p('光栅阶段：覆盖与插值','绿色点在三角形内部，灰色点在外；有覆盖的样本继续接受插值后的属性。',grid(35,35,290,176,22)+polygon(triangle,C.mint+'22',C.mint)+Array.from({length:8},(_,j)=>Array.from({length:13},(_,i)=>{const q=[43+22*i,47+22*j],e=(a,b)=>(b[0]-a[0])*(q[1]-a[1])-(b[1]-a[1])*(q[0]-a[0]),inside=e(triangle[0],triangle[1])<0&&e(triangle[1],triangle[2])<0&&e(triangle[2],triangle[0])<0;return circle(...q,2.5,inside?C.mint:C.muted);}).join('')).join(''),'产生候选片元，而非最终可见颜色'),
   p('片元与深度阶段','片元着色计算颜色；更近的绿色 0.3 通过深度测试，远处红色 0.8 被拒绝。',rect(35,58,99,67,C.red+'66')+text(84,151,'z = 0.8',C.red,17,'middle')+rect(35,169,99,43,C.mint)+text(84,195,'z = 0.3',C.bg,17,'middle')+arrow(146,134,198,134,C.orange)+rect(220,82,103,103,C.mint)+text(270,213,'最终像素',C.mint,17,'middle'),'覆盖、着色、可见性是不同任务')),
  group('同一份二维数据怎样定位表面颜色并处理边界？',
   p('纹理坐标平面','标出四角 UV；u 从左到右，v 从下到上，坐标与图像像素索引要明确约定。',checker(80,44,190,166,24,[C.mint,C.panel])+text(40,225,'(0,0)',C.blue,16)+text(272,225,'(1,0)',C.blue,16)+text(39,34,'(0,1)',C.blue,16)+text(269,34,'(1,1)',C.blue,16),'UV 是参数，不是三维位置'),
   p('纹理贴到参数化表面','棋盘按四边形的双线性参数化定位；图案大小取决于表面与参数化，而不是纹理索引本身。',uvQuad(),'纹理定位需要表面参数化'),
   p('越界：Repeat 与 Clamp','查询 u=1.2 时，Repeat 环绕到 0.2；Clamp 则钳制到最右边界 1。',rect(38,67,284,45,C.panel,C.muted)+arrow(40,123,322,123,C.muted,1.5)+circle(97,89,6,C.mint)+circle(320,89,6,C.orange)+text(59,49,'Repeat',C.mint,18)+text(243,49,'Clamp',C.orange,18)+text(98,157,'u = 0.2',C.mint,17,'middle')+text(278,157,'u = 1',C.orange,17,'middle')+text(180,199,'输入坐标：u = 1.2',C.ink,18,'middle'),'边界行为必须明确设置'))
 ],
 9:[
  group('移动 P 时，三块子三角形面积如何决定权重？',
   p('顶点 A：全部权重给 A','P 与 A 重合，对边 B–C 的子三角形等于整个三角形；另外两块面积为零。',baryDiagram([1,0,0]),'(α,β,γ) = (1,0,0)'),
   p('重心：三块面积相等','P 是三个顶点的平均位置，红、绿、蓝子三角形面积相同。',baryDiagram([1/3,1/3,1/3]),'α = β = γ = 1/3'),
   p('一般位置：不等面积','P 按 0.2A+0.3B+0.5C 得到；对应的红、绿、蓝子面积占比分别为 0.2、0.3、0.5。',baryDiagram([.2,.3,.5]),'α + β + γ = 1，内部权重非负')),
  group('屏幕中点为什么不一定是投影前线段的中点？',
   p('投影改变了参数分布','端点属性为 u=0 与 u=1，裁剪 w 分别为 1 与 3；投影前的 u=0.5 出现在屏幕 s=0.75。',line(43,128,317,128,C.muted,4)+circle(43,128,6,C.blue)+circle(317,128,6,C.purple)+circle(248.5,128,7,C.orange)+text(43,83,'w=1',C.blue,17)+text(317,83,'w=3',C.purple,17,'end')+text(226,164,'u=0.5',C.orange,17)+text(180,35,'屏幕参数 s',C.ink,18,'middle'),'u=0.5 的位置：s = 0.75'),
   p('错误：直接插值 u','屏幕中点 s=0.5 直接取两端平均得到 u=0.5，但这里没有还原不同端点的 w。',line(43,128,317,128,C.muted,4)+circle(180,128,7,C.red)+text(42,86,'u₀ = 0',C.blue,17)+text(237,86,'u₁ = 1',C.purple,17)+text(180,170,'错误 u = 0.5',C.red,18,'middle'),'屏幕线性平均会造成纹理扭曲'),
   p('正确：先插值 u/w 与 1/w','屏幕中点的 u/w 为 1/6，1/w 为 2/3；相除得到 u=1/4。',rect(40,58,280,45,C.panel,C.blue)+text(180,86,'u/w：0.5×0 + 0.5×1/3',C.blue,16,'middle')+rect(40,124,280,45,C.panel,C.purple)+text(180,152,'1/w：0.5×1 + 0.5×1/3',C.purple,16,'middle')+arrow(180,175,180,196,C.orange)+text(180,218,'(1/6)/(2/3) = 0.25',C.mint,19,'middle'),'同一屏幕中点，正确 u = 0.25')),
  group('四个纹素怎样通过两次横向插值和一次纵向插值合成颜色？',
   p('最近邻：只选一个角','明确采用图像坐标 v 向下；在 u=0.25、v=0.75 的查询点，最近的左下角值为 1。',rect(70,56,110,73,gray(0),C.muted)+rect(180,56,110,73,gray(1),C.muted)+rect(70,129,110,73,gray(1),C.muted)+rect(180,129,110,73,gray(0),C.muted)+circle(125,165.5,7,C.orange)+text(78,46,'0',C.blue,18)+text(280,46,'1',C.blue,18)+text(78,221,'1',C.blue,18)+text(280,221,'0',C.blue,18),'最近邻结果 = 1'),
   p('双线性：分成三个 lerp','上边 0→1 在 u=0.25 得到 0.25，下边 1→0 得到 0.75；再按 v=0.75 混合。',line(57,76,304,76,C.blue,3)+circle(118.75,76,6,C.blue)+text(181,50,'上边：0.25',C.blue,18,'middle')+line(57,185,304,185,C.purple,3)+circle(118.75,185,6,C.purple)+text(182,217,'下边：0.75',C.purple,18,'middle')+arrow(118.75,87,118.75,175,C.orange)+circle(118.75,157.75,6,C.mint)+text(148,156,'v = 0.75',C.mint,17),'0.25×0.25 + 0.75×0.75 = 0.625'),
   p('放大后的连续过渡','同一组 0、1、1、0 角点在整个区域双线性插值，中心值为 0.5；并非新增高分辨率细节。',Array.from({length:34},(_,j)=>Array.from({length:50},(_,i)=>rect(55+i*5,48+j*5,5.1,5.1,gray(bilinear((i+.5)/50,(j+.5)/34)))).join('')).join('')+circle(117.5,175.5,6,C.orange)+text(180,32,'四个角保持不变',C.ink,18,'middle'),'平滑过渡来自加权平均')),
  group('当一个屏幕像素覆盖许多纹素时，一个点代表得了它们吗？',
   p('单点查询：受相位支配','一个像素足迹覆盖 4×4 个交替黑白纹素；中心偏向白色纹素时，只返回 1。',checker(80,45,180,180,45,[C.ink,C.bg])+rect(80,45,180,180,'none',C.orange)+circle(195,113,7,C.orange)+text(279,112,'1',C.orange,18),'区域有一半黑，但单点只读到白'),
   p('区域平均：统计全部纹素','足迹内的 16 个纹素有 8 白、8 黑；每个中心按同等权重贡献。',checker(80,45,180,180,45,[C.ink,C.bg])+Array.from({length:4},(_,j)=>Array.from({length:4},(_,i)=>circle(102.5+45*i,67.5+45*j,4,C.orange)).join('')).join(''),'平均值 = (8×1 + 8×0)/16 = 0.5'),
   p('不同相位：稳定的区域值','对覆盖完整周期的足迹求平均，移动相位仍为 0.5；正确低通能抑制缩小时的闪烁。',[-1,0,1].map((offset,i)=>rect(37+i*104,66,80,116,gray(.5),C.muted)+text(77+i*104,209,`相位 ${offset}`,C.muted,17,'middle')).join(''),'预过滤对应像素的完整足迹')),
  group('足迹扩大 16 倍，应该选择哪一层？',
   p('逐层减半：预存低通结果','尺寸每层减半、面积每层为前一层 1/4。示意显示 128²、64²、32²、16² 四级。',[[25,55,128],[181,55,64],[265,55,32],[311,55,16]].map(([x,y,size],i)=>checker(x,y,size,size,Math.max(4,size/8),i?[gray(.5),gray(.5)]:[C.ink,C.bg])+text(x+size/2,y+size+25,`${size}²`,C.mint,16,'middle')).join(''),'完整二维链约占原图 4/3 存储'),
   p('原图足迹宽 d = 16','足迹在两个方向都覆盖 16 个原图纹素，选择 log₂16=4 层。',checker(75,42,192,176,12,[C.mint,C.panel])+rect(75,42,192,176,'none',C.orange)+text(180,30,'16 × 16 原图纹素',C.orange,17,'middle')+rect(142,99,58,58,gray(.5),C.orange)+text(287,132,'L4',C.orange,18),'D = log₂16 = 4'),
   p('三线性：相邻两层平滑切换','需要 D=4.3 时，在第 4 层与第 5 层的双线性结果之间再插值；不是简单跳层。',rect(45,68,110,105,C.blue+'88',C.blue)+rect(210,68,110,105,C.purple+'88',C.purple)+text(100,48,'第 4 层',C.blue,18,'middle')+text(265,48,'第 5 层',C.purple,18,'middle')+text(100,203,'权重 0.7',C.blue,17,'middle')+text(265,203,'权重 0.3',C.purple,17,'middle')+arrow(164,119,200,119,C.orange),'结果 = 0.7C₄ + 0.3C₅')),
  group('长轴 16、短轴 1 的足迹，为什么一个正方形层级会过度模糊？',
   p('斜视：足迹长而窄','绿色表示实际足迹，横向覆盖 16 纹素、纵向仅覆盖 1 纹素。',checker(52,50,256,162,16,[C.mint+'88',C.panel])+rect(52,122,256,16,'none',C.orange)+text(180,35,'实际足迹：16 × 1',C.orange,18,'middle'),'只有长轴需要大范围平均'),
   p('各向同性 Mipmap 近似','根据最大轴 16 选择层级时，用 16×16 的正方形近似，额外混入短轴方向的信息。',checker(76,35,208,192,13,[C.mint+'88',C.panel])+rect(76,35,208,192,C.blue+'44',C.blue)+rect(76,125,208,13,'none',C.orange)+text(180,28,'近似范围：16 × 16',C.blue,17,'middle'),'短轴查询范围扩大了 16 倍'),
   p('各向异性：沿长轴取样','图中 16 个小查询沿长轴排布，每个约覆盖 1×1 纹素；保留短轴的分辨率。',checker(52,50,256,162,16,[C.mint+'88',C.panel])+Array.from({length:16},(_,i)=>rect(52+i*16,122,16,16,C.orange+'66',C.orange)).join('')+text(180,34,'16 个查询沿长轴排列',C.orange,17,'middle'),'足迹方向决定额外查询的方向'))
 ],
 10:[
  group('同一个纹理查询接口能返回颜色、方向还是光照？',
   p('颜色纹理：记录反照率','棋盘的两种颜色表示材质数据，光照计算再决定它们最终有多亮。',checker(70,45,220,174,22,[C.mint,C.purple])+text(180,30,'RGB：材质颜色',C.ink,18,'middle'),'纹理值有含义，并不总是最终颜色'),
   p('法线纹理：记录方向','示例球面把方向 n 编码为 0.5n+0.5；作为法线数据读取时需解码并变换坐标空间。',sphere(180,125,78,{mode:'normal'})+text(180,30,'RGB：法线方向',C.ink,18,'middle'),'读取方向不能当作普通颜色光照'),
   p('环境纹理：按方向查光','球面环境图的水平轴代表方位角；φ=0 的方向查询 u=0.5。环境远场假设忽略位置。',rect(42,45,276,104,C.panel,C.muted)+Array.from({length:46},(_,i)=>rect(42+i*6,45,6.1,104,`hsl(${Math.round(i*360/46)} 45% 55%)`)).join('')+line(180,45,180,149,C.ink,2)+arrow(180,206,180,162,C.orange)+text(180,227,'φ = 0 → u = 0.5',C.orange,17,'middle'),'远场环境主要依赖查询方向')),
  group('同一高度函数用于凹凸和位移时，哪些位置真的改变了？',
   ...['flat','bump','displace'].map(mode=>{let out='';const samples=Array.from({length:181},(_,i)=>{const x=45+270*i/180;return [x,150-20*Math.sin(2*Math.PI*(x-45)/90)];});out+=polyline(mode==='displace'?samples:[[45,150],[315,150]],C.mint,3);if(mode==='bump')out+=polyline(samples,C.muted,1.5,'5 4');for(let i=0;i<9;i++){const x=60+i*30,y=mode==='displace'?150-20*Math.sin(2*Math.PI*(x-45)/90):150,slope=mode==='flat'?0:-20*2*Math.PI/90*Math.cos(2*Math.PI*(x-45)/90),n=normalize([slope,-1]);out+=arrow(x,y,x+35*n[0],y+35*n[1],C.blue,2);}out+=text(180,38,mode==='flat'?'原表面':mode==='bump'?'位置不动，法线扰动':'位置与法线都改变',C.ink,18,'middle');return p(mode==='flat'?'平面与原始法线':mode==='bump'?'凹凸：只改变局部法线':'位移：实际移动表面',mode==='flat'?'绿色为实际表面，蓝箭头是法线。':mode==='bump'?'绿色表面仍平直；灰色高度函数只用于估计斜率和扰动法线。':'绿色轮廓按高度函数起伏；蓝箭头依据实际曲线切线计算。',out,mode==='flat'?'原轮廓保持平直':mode==='bump'?'明暗改变，轮廓没有起伏':'真实轮廓与几何遮挡能够改变');})),
  group('函数、体素和预计算结果分别存储了什么信息？',
   p('程序纹理：确定函数生成','纹理由三个不同频率的正弦函数叠加生成；没有使用随机线条或外部图片。',Array.from({length:36},(_,j)=>Array.from({length:56},(_,i)=>{const v=.5+.22*Math.sin(i*.28+j*.12)+.13*Math.sin(i*.62-j*.3)+.08*Math.sin(j*.87);return rect(40+i*5,42+j*5,5.1,5.1,`rgb(${Math.round(85+v*130)},${Math.round(95+v*110)},${Math.round(100+v*90)})`);}).join('')).join(''),'输入尺度决定细节频率与混叠风险'),
   p('体纹理：连续切片保存密度','同一球状密度场的三个 z 切片：中心切片截面较大，两侧切片较小。',[-.7,0,.7].map((z,i)=>{const cx=70+i*110;return rect(cx-45,65,90,125,C.panel,C.muted)+circle(cx,127,37*Math.sqrt(1-z*z),C.blue+'88',C.blue)+text(cx,215,`z=${z}`,C.blue,16,'middle');}).join(''),'三维数据中的 z 也参与查询'),
   p('光照贴图：预计算会过时','紫色是物体旧位置和预存阴影；绿色物体移动后，旧阴影仍保留，说明数据已经失效。',polygon([[35,179],[197,79],[328,139],[164,220]],C.panel,C.muted)+polygon([[83,176],[155,132],[216,160],[143,203]],C.purple+'66',C.purple)+cube(98,105,27,[C.purple+'88',C.purple+'55',C.purple+'33'])+cube(246,122,28)+arrow(137,72,219,91,C.orange)+text(36,33,'物体移动，旧阴影未更新',C.ink,17),'场景变化后需重新计算照明')),
  group('同一个圆形截面，哪种表示更方便生成点或判断内外？',
   p('隐式：代入函数判断符号','半径 1 的圆截面以 f=x²+y²−1 表示；中心负、边界零、外部正。',circle(180,124,77,C.mint+'22',C.mint)+label(180,124,'f = −1',C.mint)+label(257,124,'f = 0',C.blue)+label(304,60,'f > 0',C.orange),'容易问：这个点在内部吗？'),
   p('参数式：直接生成表面点','以 p(θ)=(cosθ,sinθ) 生成同一个圆截面；橙点代表 θ=45°。',circle(180,125,77,'none',C.mint)+arrow(180,125,257,125,C.muted,1.5)+arrow(180,125,234.45,70.55,C.orange)+circle(234.45,70.55,6,C.orange)+text(251,68,'45°',C.orange,17)+text(43,218,'p = (√2/2, √2/2)',C.ink,17),'容易问：参数 θ 对应哪个点？'),
   p('网格：有限多边形近似','蓝色圆为真实边界，绿色 12 边形为显式离散近似；边数影响逼近误差。',circle(180,125,77,'none',C.blue,1.5)+polygon(Array.from({length:12},(_,i)=>[180+77*Math.cos(i*Math.PI/6),125-77*Math.sin(i*Math.PI/6)]),C.mint+'22',C.mint,2.5),'查询方便性取决于表示和任务')),
  group('内部取负时，min、max 和取反分别怎样实现布尔操作？',
   p('并集：属于 A 或 B','两个圆的全部内部都被着色；min(fA,fB)<0 表示至少一个体内部。',circle(135,125,64,C.mint+'77',C.mint)+circle(225,125,64,C.mint+'77',C.mint)+text(104,38,'A',C.blue,18)+text(233,38,'B',C.purple,18),'A∪B：min(fA,fB)'),
   p('交集：同时属于 A 与 B','只有两个圆重叠的透镜区域着色；max(fA,fB)<0 要求两个函数都为负。','<defs><clipPath id="intersectionB"><circle cx="225" cy="125" r="64"/></clipPath></defs>'+circle(135,125,64,'none',C.blue)+circle(225,125,64,'none',C.purple)+'<g clip-path="url(#intersectionB)">'+circle(135,125,64,C.mint+'bb','none')+'</g>','A∩B：max(fA,fB)'),
   p('差集：保留 A，挖掉 B','绿色只保留左圆内部且右圆外部；B 的符号取反后参与 max。','<defs><mask id="subtractB"><rect width="360" height="264" fill="white"/><circle cx="225" cy="125" r="64" fill="black"/></mask></defs>'+circle(135,125,64,'none',C.blue)+circle(225,125,64,'none',C.purple)+'<g mask="url(#subtractB)">'+circle(135,125,64,C.mint+'bb','none')+'</g>','A−B：max(fA,−fB)')),
  group('规则很短或查询很快，是否意味着表示不付出存储和细节代价？',
   p('水平集：场的一个等值面','圆截面 d=0 是绿色边界，d=±0.3 是内外两条等距轮廓；网格保存标量场样本。',grid(42,34,276,180,18)+circle(180,124,43,'none',C.blue,2)+circle(180,124,61,'none',C.mint,3)+circle(180,124,79,'none',C.purple,2)+text(176,75,'−0.3',C.blue,16)+text(176,58,'0',C.mint,16)+text(176,40,'+0.3',C.purple,16),'网格分辨率限制最小可表达特征'),
   p('分形：短规则生成多尺度细节','同一等边三角形依次执行 0、1、2 次 Koch 替换，每一段被四段较短线段替代。',(()=>{let out='';for(let level=0;level<3;level++){const cx=69+110*level;let q=[[cx-40,168],[cx+40,168],[cx,168-40*Math.sqrt(3)],[cx-40,168]];for(let k=0;k<level;k++){const next=[];for(let i=0;i<q.length-1;i++){const a=q[i],b=q[i+1],u=mix(a,b,1/3),v=mix(a,b,2/3),dx=(b[0]-a[0])/3,dy=(b[1]-a[1])/3,peak=[u[0]+.5*dx-Math.sqrt(3)/2*dy,u[1]+.5*dy+Math.sqrt(3)/2*dx];next.push(a,u,peak,v);}q=[...next,q.at(-1)];}out+=polyline(q,[C.blue,C.mint,C.purple][level],2)+text(cx,224,`迭代 ${level}`,C.muted,17,'middle');}return out;})(),'规则长度小，生成的元素数仍增长'),
   p('体网格：每轴翻倍，体素乘八','从 N³ 到 (2N)³，体素数量增长为 8 倍；三维场与表面网格的存储规律不同。',box3([-.9,-.9,-.9],[.9,.9,.9],C.blue,32,[78,122])+box3([-1,-1,-1],[1,1,1],C.mint,54,[253,122])+text(78,208,'N³',C.blue,19,'middle')+text(253,208,'(2N)³',C.mint,19,'middle'),'分辨率翻倍：存储约 ×8'))
 ],
 11:[
  group('相同的顶点位置，缺少连接或属性索引后会丢掉什么？',
   p('点云：只有位置采样','两行共 8 个点没有面连接，不能仅从位置推断唯一表面拓扑。',[[70,90],[140,60],[220,78],[290,113],[70,183],[140,153],[220,171],[290,206]].map(q=>circle(...q,6,C.mint)).join('')+text(180,32,'8 个相同位置样本',C.ink,18,'middle'),'位置和连接关系是不同信息'),
   p('网格：明确连接成表面','与点云使用相同的 8 个位置，通过边和面连接成三块四边形。',(()=>{const top=[[70,90],[140,60],[220,78],[290,113]],bottom=top.map(([x,y])=>[x,y+93]);return Array.from({length:3},(_,i)=>polygon([top[i],top[i+1],bottom[i+1],bottom[i]],C.mint+'33',C.mint)).join('')+[...top,...bottom].map(q=>circle(...q,5,C.orange)).join('');})(),'连接关系决定表面拓扑'),
   p('OBJ：位置、UV、法线可独立索引','示例 f 的三个条目分别引用位置/UV/法线；共享位置在接缝处可以引用不同 UV。',rect(29,45,302,173,C.panel,C.grid)+['v  0 0 0','vt 0.25 0.75','vn 0 0 1','f  1/1/1 2/2/1 3/3/1'].map((s,i)=>text(45,77+i*37,s,[C.blue,C.purple,C.mint,C.orange][i],17)).join(''),'v、vt、vn 是不同的索引序列')),
  group('同一个 t 逐层插值，最后留下的点会怎样移动？',
   ...[.25,.5,.75].map(t=>p(`de Casteljau：t = ${t}`,'灰线连接原控制点，蓝线为第一层、紫线为第二层，橙点为最后的曲线位置。',casteljau(t),`每一层都使用同一个 t = ${t}`))),
  group('Bernstein 权重、凸包与仿射不变性之间有什么联系？',
   p('t = 0.25 的四个权重','三次 Bernstein 权重全部非负；四柱高度按真实权重绘制，合计为 1。',bars(bernstein(.25),37,191,286,128,[C.blue,C.mint,C.purple,C.orange])+bernstein(.25).map((v,i)=>text(72.75+71.5*i,179-128*v,fmt(v,6),[C.blue,C.mint,C.purple,C.orange][i],16,'middle')+text(72.75+71.5*i,217,`b${i}`,C.muted,17,'middle')).join(''),'四个权重均非负，且总和 = 1'),
   p('凸组合：曲线位于凸包内','控制点围成绿色凸包，橙色曲线不能跑到外面；但中间控制点通常不在曲线上。',polygon([control[0],control[1],control[2],control[3]],C.mint+'22',C.mint,1.5)+curve(control,C.orange)+control.map((q,i)=>label(...q,`P${i}`,C.muted)).join(''),'权重非负且和为 1 ⇒ 凸包性质'),
   p('仿射变换与求曲线可交换','灰线是原曲线；将控制点绕中心旋转 15° 后生成绿色曲线，与直接旋转原曲线一致。',(()=>{const original=[[65,180],[100,75],[240,65],[290,180]],a=Math.PI/12,transform=([x,y])=>[180+(x-180)*Math.cos(a)-(y-130)*Math.sin(a),130+(x-180)*Math.sin(a)+(y-130)*Math.cos(a)],q=original.map(transform);return curve(original,C.muted,2)+polyline(q,C.mint,1.5,'5 4')+curve(q,C.mint)+q.map(v=>circle(...v,4,C.mint)).join('');})(),'T(ΣbᵢPᵢ) = ΣbᵢT(Pᵢ)')),
  group('共用端点、切向同向、导数相等，分别约束了什么？',
   p('只有 C⁰：位置接上','两段共享橙色端点，但蓝色末端切向与绿色首端切向不同，接点出现方向拐弯。',continuity('C0'),'只要求前段终点 = 后段起点'),
   p('G¹：方向相同，速度不同','接点两侧控制柄同向，但后一段的柄长是前一段的两倍；参数时间尺度相同。',continuity('G1'),'末导数 135；首导数 270'),
   p('C¹：方向和速度都匹配','两个三次段的控制柄同向、等长，并假定两段使用相同参数时间尺度。',continuity('C1'),'末导数 = 首导数 = (135,0)')),
  group('为什么多段低次曲线能降低修改范围，有理权重又能表达什么？',
   p('一段高次：影响整个区间','灰线是原五次曲线；只移动一个中间控制点，绿色曲线在整个开区间都有变化。',(()=>{const a=[[30,177],[72,67],[121,192],[194,185],[265,58],[329,171]],b=a.map(v=>[...v]);b[2]=[121,45];return curve(a,C.muted,2)+curve(b,C.mint)+polyline(b,C.grid,1,'4 4')+arrow(...a[2],...b[2],C.orange)+circle(...b[2],5,C.orange);})(),'控制点增多不等于获得局部控制'),
   p('两段三次：限定修改范围','灰线是第一段的旧曲线，绿色为修改后的第一段；第二段蓝色保持不变。修改的是第一段内柄。',(()=>{const a=[[30,178],[65,155],[105,100],[180,120]],b=[[30,178],[65,49],[105,100],[180,120]],c=[[180,120],[225,139],[286,87],[330,181]];return curve(a,C.muted,2)+curve(b,C.mint)+curve(c,C.blue)+arrow(...a[1],...b[1],C.orange)+text(35,211,'修改第 1 段',C.mint,17)+text(211,211,'第 2 段保持',C.blue,17);})(),'分段提供局部编辑与拼接约束'),
   p('补充：有理权重表达圆弧','蓝色为普通二次 Bézier，绿色采用中间权重 √2/2，可精确表达四分之一圆；这是 NURBS 方向的补充示例。',(()=>{const screen=([x,y])=>[80+145*x,206-145*y],q=[[1,0],[1,1],[0,1]],w=Math.SQRT1_2,out=curve(q.map(screen),C.blue),r=Array.from({length:101},(_,i)=>{const t=i/100,a=(1-t)**2,b=2*w*t*(1-t),c=t*t;return screen([(a+b)/(a+b+c),(b+c)/(a+b+c)]);});return out+polyline(r,C.mint,3)+polyline(q.map(screen),C.grid,1.5,'4 4')+text(232,84,'权重 w',C.mint,17)+text(236,109,'= √2/2',C.mint,17);})(),'普通中点 (0.75,0.75) 不在单位圆上')),
  group('两个参数与 16 个控制点怎样共同决定曲面位置？',
   p('4×4 控制网格','紫色点是 16 个控制点，灰线是控制网格；曲面一般不经过所有控制点。',surface('control')+text(180,29,'16 个控制点',C.purple,18,'middle'),'双三次曲面有两个参数 u、v'),
   p('先沿行求点，再沿列求点','固定 u=0.5，四行各得到一个蓝点，再对这四点按 v 求曲线；橙点取 v=0.5。',surface('construction'),'S(0.5,0.5) 来自两轮曲线求值'),
   p('细分显示与曲面法线','绿色四边形是规则参数采样得到的网格；橙色法线来自两条局部切向的叉积。',surface('mesh')+text(180,29,'n ∝ Sᵤ × Sᵥ',C.orange,18,'middle'),'参数间隔均匀 ≠ 几何距离均匀'))
 ],
 12:[
  group('细分、简化、重网格化分别在优化什么？',
   p('细分：增加元素','把一片三角形分成四片；仅连线并不会自动平滑，位置更新仍不可少。',(()=>{const a=[55,202],b=[311,202],c=[160,46],ab=mix(a,b,.5),bc=mix(b,c,.5),ca=mix(c,a,.5);return polygon([a,b,c],C.mint+'33',C.mint)+polygon([ab,bc,ca],C.purple+'44',C.mint)+[ab,bc,ca].map(q=>circle(...q,5,C.orange)).join('');})(),'面数增加：1 → 4'),
   p('简化：删除元素并控制误差','灰色六边形是旧边界，绿色将一个顶部顶点删除并用直边连接；局部轮廓出现误差。',(()=>{const q=Array.from({length:6},(_,i)=>[180+87*Math.cos(i*Math.PI/3),132+77*Math.sin(i*Math.PI/3)]),simple=q.filter((_,i)=>i!==4);return polygon(q,'none',C.muted,2)+polygon(simple,C.mint+'33',C.mint,3)+circle(...q[4],6,C.red)+text(180,30,'减少元素，比较原边界',C.ink,17,'middle');})(),'元素变少，误差不能忽略'),
   p('重网格化：改善三角形质量','同一四边形保持四个顶点，灰色虚线与绿色线是两种对角连接；绿色方案提高了最小角。',polygon([[65,65],[280,85],[230,205],[105,145]],C.panel,C.muted)+line(65,65,230,205,C.muted,2,'5 4')+line(280,85,105,145,C.mint,3)+text(180,34,'边翻转改变元素形状',C.ink,18,'middle'),'最小角：14.7° → 24.2°')),
  group('Loop 的拓扑连线和加权位置更新怎样分工？',
   p('连线：每片三角形变四片','橙点只示意新边点的拓扑位置；准确位置仍需两端与对面顶点共同加权。',(()=>{const a=[57,203],b=[309,203],c=[160,43],ab=mix(a,b,.5),bc=mix(b,c,.5),ca=mix(c,a,.5);return polygon([a,b,c],C.panel,C.mint)+polygon([ab,bc,ca],C.purple+'44',C.mint)+[ab,bc,ca].map(q=>circle(...q,6,C.orange)).join('');})(),'插点与连线规则，并非位置规则'),
   p('内部边：不是总取中点','A=(90,130)、B=(270,130)，对面 C=(90,40)、D=(90,200)。新点为 (157.5,127.5)，不同于中点。',polygon([[90,130],[270,130],[90,40]],C.blue+'22',C.blue)+polygon([[90,130],[270,130],[90,200]],C.purple+'22',C.purple)+label(90,130,'A',C.blue)+label(270,130,'B',C.blue)+label(90,40,'C',C.purple)+label(90,200,'D',C.purple)+circle(180,130,5,'none',C.muted)+circle(157.5,127.5,6,C.orange)+text(176,167,'新边点',C.orange,17),'3/8(A+B) + 1/8(C+D)'),
   p('旧点：按度数重新加权','橙色旧点的度数 n=3，邻居为上、左下、右下三个蓝点；采用 β=3/16 同步更新。',(()=>{const q=[180,110],neighbors=[[75,190],[285,190],[180,35]],updated=q.map((x,j)=>7/16*x+3/16*neighbors.reduce((s,v)=>s+v[j],0));return neighbors.map(v=>line(...q,...v,C.grid,2)+circle(...v,6,C.blue)).join('')+circle(...q,7,C.orange)+circle(...updated,7,C.mint)+arrow(q[0]+18,q[1],updated[0]+18,updated[1],C.mint)+text(214,109,'旧 P',C.orange,17)+text(214,149,'新 P′',C.mint,17);})(),'P′ = 7/16 P + 3/16 Σ邻居')),
  group('Catmull–Clark 的面点、边点、旧点需要哪些邻接信息？',
   p('面点：所有顶点的平均','五边形取顶点平均作为橙色面点；连接新边点后得到五个四边形。边点这里只示意连接拓扑。',(()=>{const q=[[180,36],[296,104],[256,206],[104,206],[64,104]],center=[0,1].map(j=>q.reduce((s,v)=>s+v[j],0)/5);return polygon(q,C.panel,C.muted)+q.map((v,i)=>{const a=mix(v,q[(i+1)%5],.5),b=mix(q[(i+4)%5],v,.5);return polygon([v,a,center,b],i%2?C.mint+'22':C.purple+'22',C.mint,1.5);}).join('')+circle(...center,7,C.orange);})(),'n 边形细分为 n 个四边形'),
   p('内部边点：四项平均','共享边端点 A、B 和左右面点 F₁、F₂ 各占 1/4；面点由各自原面先计算得到。',polygon([[65,50],[180,65],[180,190],[65,165]],C.blue+'22',C.blue)+polygon([[180,65],[290,105],[290,210],[180,190]],C.purple+'22',C.purple)+label(180,65,'A',C.orange)+label(180,190,'B',C.orange)+label(122.5,117.5,'F₁',C.blue)+label(235,142.5,'F₂',C.purple)+circle((180+180+122.5+235)/4,(65+190+117.5+142.5)/4,7,C.mint),'E = (A+B+F₁+F₂)/4'),
   p('内部旧点：按度数更新','给出 n=4、P=(0,0)、面点平均 F=(1,1)、边中点平均 R=(1,0)，图中按同一尺度绘制。',axes(110,179,128)+label(110,179,'P',C.orange)+label(200,89,'F',C.blue)+label(200,179,'R',C.purple)+circle(177.5,156.5,7,C.mint)+text(187,143,'P′',C.mint,18)+text(42,36,'n=4：P′=(F+2R+P)/4',C.ink,17),'新 P′ = (0.75,0.25)')),
  group('将两端点合并在哪里，才能使到原平面的平方距离更小？',
   p('平面误差：两个正交约束','用二维截面展示 x=0 与 y=0 两个单位平面；误差为 E=x²+y²，交点误差为零。',line(180,36,180,211,C.blue,3)+line(38,150,322,150,C.purple,3)+circle(180,150,7,C.mint)+text(197,52,'x=0',C.blue,17)+text(268,179,'y=0',C.purple,17)+circle(251,80,6,C.orange)+line(251,80,180,80,C.blue,1.5,'4 4')+line(251,80,251,150,C.purple,1.5,'4 4'),'累加平方距离：E(p)=pᵀQp'),
   p('最优点比中点误差更小','候选端点 A=(-1,0)、B=(0,1) 各为 E=1；中点 E=0.5，最优交点 E=0。',line(180,38,180,213,C.grid)+line(43,150,316,150,C.grid)+label(110,150,'A：1',C.blue)+label(180,80,'B：1',C.purple)+label(145,115,'中点：0.5',C.orange)+circle(180,150,7,C.mint)+text(196,173,'最优：0',C.mint,17),'几何误差最小点不必是中点'),
   p('奇异约束：最优点不唯一','只有 y=0 约束时，绿色整条线上误差均为零；不能假装矩阵总可逆。',line(32,143,328,143,C.mint,4)+[85,180,275].map(x=>circle(x,143,7,C.orange)).join('')+arrow(180,92,180,143,C.blue)+text(180,51,'E = y²，与 x 无关',C.ink,18,'middle')+text(180,206,'端点、中点等候选需比较',C.muted,17,'middle'),'还要检查拓扑合法性与翻面')),
  group('相机看见的地面点，光源是否也能看见？',
   p('第一遍：光源最近深度','光源位于顶部，中心射线先遇到红色遮挡物；阴影图保存最近深度 0.4，而不是后方地面 0.8。',circle(180,35,9,C.orange)+arrow(180,47,180,98,C.orange)+rect(139,99,82,24,C.red)+line(48,204,317,204,C.muted,3)+line(180,125,180,203,C.red,2,'5 4')+text(235,114,'0.4',C.red,18)+text(225,201,'0.8',C.muted,18),'光源深度图只保留最近表面'),
   p('第二遍：比较相同光空间深度','相机可以看见地面 P，但它的光源空间深度为 0.8，大于对应阴影图的 0.4。',circle(180,35,9,C.orange)+rect(139,99,82,24,C.red)+line(48,204,317,204,C.muted,3)+label(180,204,'P',C.blue)+arrow(316,97,183,201,C.purple)+text(303,77,'相机',C.purple,17,'end')+line(180,44,180,204,C.orange,2,'5 4'),'0.8 > 0.4：光路被遮挡'),
   p('另一个点：光源路径畅通','光源到右侧地面点的路径绕过遮挡物，阴影图存的是同一个地面深度，所以比较通过。',circle(180,35,9,C.orange)+rect(139,99,82,24,C.red)+line(48,204,317,204,C.muted,3)+arrow(180,35,292,204,C.mint)+label(292,204,'P',C.mint)+text(47,172,'深度相等',C.mint,18),'同一深度映射：不是比较世界距离')),
  group('偏移为什么存在折中，PCF 又在平均什么？',
   p('偏移太小：自己遮住自己','同一表面因为有限精度，查询深度为 0.401、图中为 0.400，零偏移会错误判为阴影。',rect(43,55,275,38,C.panel,C.blue)+text(181,81,'D = 0.400，z = 0.401',C.ink,17,'middle')+rect(44,117,274,95,C.mint+'22',C.mint)+Array.from({length:12},(_,i)=>circle(58+i*21,146+(i%3)*23,6,C.red)).join('')+text(180,33,'bias = 0',C.red,18,'middle'),'0.401 > 0.400：错误自遮挡'),
   p('偏移太大：真实阴影丢失','实际遮挡点 z=0.415，本应比 D=0.400 更远；偏移 0.020 却使阈值变为 0.420。',rect(43,65,275,47,C.panel,C.orange)+text(180,94,'0.415 ≤ 0.400 + 0.020',C.orange,17,'middle')+rect(78,130,74,65,C.mint)+rect(158,196,131,15,C.purple+'88')+line(40,211,320,211,C.muted,2)+text(180,35,'bias = 0.020',C.orange,18,'middle'),'真实遮挡被误判为受光：悬浮感'),
   p('PCF：平均多个比较结果','四次比较分别得到受光 1、1 和遮挡 0、0；平均的是可见性判断，不是直接平均深度。',[[1,C.ink],[1,C.ink],[0,C.bg],[0,C.bg]].map(([v,color],i)=>rect(71+(i%2)*96,51+Math.floor(i/2)*72,96,72,color,C.muted)+text(119+(i%2)*96,94+Math.floor(i/2)*72,String(v),v?C.bg:C.ink,20,'middle')).join('')+arrow(277,125,309,125,C.orange)+rect(313,79,20,98,gray(.5)),'可见性 = (1+1+0+0)/4 = 0.5'))
 ]
};
