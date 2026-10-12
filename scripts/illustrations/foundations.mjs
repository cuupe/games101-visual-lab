import {C,text,line,arrow,rect,circle,polygon,polyline,path,grid,axes,label,project3,box3,cube,checker,sphere,normalize,dot,panel as p,group as g} from './primitives.mjs';

const footer=s=>text(180,248,s,C.mint,16,'middle');
const make=(focus,titles,captions,draw)=>g(focus,...titles.map((title,i)=>p(title,captions[i],draw(i))));
const map2=(a,o=[85,210],s=42)=>[o[0]+s*a[0],o[1]-s*a[1]];
const transform=(q,a)=>[a[0]*q[0]+a[1]*q[1],a[2]*q[0]+a[3]*q[1]];
const rot=angle=>{const t=angle*Math.PI/180;return [Math.cos(t),-Math.sin(t),Math.sin(t),Math.cos(t)];};
function shape(a,origin=[140,190],scale=62){
 const points=[[0,0],[1,0],[1,1],[0,1]],world=points.map(q=>map2(transform(q,a),origin,scale));
 return grid()+polygon(points.map(q=>map2(q,origin,scale)),'none',C.muted,1.3)+polygon(world,'#193e43',C.mint)+arrow(...origin,...map2(transform([1,0],a),origin,scale),C.mint)+arrow(...origin,...map2(transform([0,1],a),origin,scale),C.purple);
}
function pixelTriangle(i){
 let out='';const cols=[8,16,32][i],cell=240/cols;
 for(let y=0;y<cols*.7;y++)for(let x=0;x<cols;x++){const nx=(x+.5)/cols,ny=(y+.5)/(cols*.7);const inside=ny>.14&&ny<.85&&nx>.15+.3*(1-ny)&&nx<.88-.45*(1-ny);out+=rect(60+x*cell,32+y*cell,cell-1,cell-1,inside?C.mint:C.panel);}
 return out+footer(cols+' 列像素 · 中心覆盖测试');
}
function budget(i){const limits=[16.7,33.3,1000],counts=[2,4,15];let out=text(35,42,'单帧预算 '+limits[i]+' ms',C.ink,20)+line(35,206,325,206,C.muted);for(let j=0;j<counts[i];j++)out+=rect(38+j*285/counts[i],82,282/counts[i]-3,104,j%2?C.purple:C.mint);return out+text(180,223,'每块代表一项计算开销',C.muted,15,'middle')+footer(['约 60 帧 / 秒','约 30 帧 / 秒','约 1 帧 / 秒'][i]);}
function rayScene(stage){let out=polygon([[50,195],[300,195],[275,130],[82,130]],'#182d39',C.grid)+circle(180,133,40,C.purple)+rect(74,40,48,13,C.orange)+circle(300,95,8,C.blue);
 if(stage===0)out+=arrow(300,95,205,105,C.blue)+text(242,75,'相机',C.blue,16);
 if(stage===1)out+=arrow(300,95,205,105,C.blue)+arrow(205,105,100,54,C.orange)+text(45,28,'灯光',C.orange,16);
 if(stage===2)out+=arrow(300,95,205,105,C.blue)+arrow(205,105,243,184,C.mint)+arrow(243,184,100,54,C.orange)+text(232,214,'反弹',C.mint,16);
 return out+footer(['寻找可见表面','检查直接光是否被遮挡','追踪间接光路径'][stage]);
}
function pointVector(i){let out=grid()+axes(72,213,164);if(i===0)return out+label(...map2([2,3],[72,213],42),'P=(2,3)',C.blue)+footer('点：相对于原点的位置');
 if(i===1){const a=map2([.5,.5],[72,213],42),b=map2([3.5,2.5],[72,213],42),c=map2([2,1],[72,213],42),d=map2([5,3],[72,213],42);return out+arrow(...a,...b,C.mint)+arrow(...c,...d,C.purple)+footer('两处箭头的位移都是 (3,2)');}
 return out+arrow(72,213,156,101,C.muted,3)+arrow(72,213,88.8,190.6,C.mint,4)+text(157,95,'v=(3,4)',C.muted,16)+text(96,187,'v / 5',C.mint,16)+footer('长度 5 → 1，方向不变');}
function dotFigure(i){const a=[0,60,120][i]*Math.PI/180,o=[130,173],r=102,e=[o[0]+r*Math.cos(a),o[1]-r*Math.sin(a)],pr=[e[0],o[1]];return grid()+arrow(...o,o[0]+r,o[1],C.blue)+arrow(...o,...e,C.mint)+line(...e,...pr,C.muted,1.6,'5 4')+arrow(...o,...pr,C.orange,4)+text(32,34,'θ = '+[0,60,120][i]+'°',C.ink,20)+text(249,174,'a',C.blue)+text(e[0]+6,e[1]-8,'b',C.mint)+footer('单位向量点积 = '+[1,.5,-.5][i]);}
function crossFigure(i){const o=project3([0,0,0]),u=[2,0,0],v=i===2?[1,0,0]:[0,1.5,0],normal=i===1?[0,0,-3]:[0,0,3],a=project3(u),b=project3(v),sum=project3(u.map((x,j)=>x+v[j]));let out=polygon([o,a,sum,b],'#183c3c',C.grid)+arrow(...o,...a,C.mint)+arrow(...o,...b,C.purple);if(i!==2)out+=arrow(...o,...project3(normal,38),C.orange)+text(37,212,i===1?'n 朝向 −z':'n 朝向 +z',C.orange,16);return out+text(45,35,i===1?'交换 a、b 的次序':i===2?'两条边共线':'右手定则',C.ink,20)+footer(i===2?'叉积为零 · 面积为零':'平行四边形面积 = 3');}
function basis(i){const o=[110,206],s=57,u=i===0?[1,0]:i===1?[Math.SQRT1_2,Math.SQRT1_2]:[1,0],v=i===0?[0,1]:i===1?[-Math.SQRT1_2,Math.SQRT1_2]:[.6,.8];return grid()+arrow(...o,...map2(u,o,s),C.mint)+arrow(...o,...map2(v,o,s),C.purple)+arrow(...o,...map2([2,1],o,s),C.blue)+text(231,148,'p=(2,1)',C.blue,16)+text(28,35,['正交单位基','把基旋转 45°','非正交单位基'][i],C.ink,20)+footer(['坐标 (2,1)','坐标 (2.121,−0.707)','系数 (1.25,1.25) ≠ 点积'][i]);}
function normalFigure(i){const o=[185,189],t=i===0?[1,1]:[2,1],v=i===0?[-1,1]:i===1?[-2,1]:[-.5,1];return grid()+arrow(...o,...map2(t,o,45),C.mint)+arrow(...o,...map2(v,o,45),i===1?C.red:C.purple)+text(37,38,['原表面','错误：法线也乘 A','正确：法线乘逆转置'][i],C.ink,18)+text(278,148,'t',C.mint)+text(map2(v,o,45)[0]-20,132,'n',C.purple)+footer(['t · n = 0','(2,1) · (−2,1) = −3','(2,1) · (−0.5,1) = 0'][i]);}
function translateFigure(i){const o=[70,210],start=[1,1],end=i===0?start:i===1?[3,1]:start;return grid()+axes(...o,176)+arrow(...o,...map2(start,o,48),C.muted)+arrow(...o,...map2(end,o,48),C.mint)+text(32,34,['原始点 (1,1,1)','点 w=1：加平移 (2,0)','方向 w=0：平移被忽略'][i],C.ink,17)+footer(['齐次坐标最后一项为 1','(1,1,1) → (3,1,1)','(1,1,0) → (1,1,0)'][i]);}
function composeFigure(i){const o=[90,212],points=i===0?[[1,0]]:i===1?[[1,0],[3,0],[0,3]]:[[1,0],[0,1],[2,1]];let out=grid()+axes(...o,195);points.forEach((q,j)=>{out+=label(...map2(q,o,46),j?'p'+j:'p',j===points.length-1?C.mint:C.muted);if(j)out+=arrow(...map2(points[j-1],o,46),...map2(q,o,46),j===1?C.orange:C.purple);});return out+text(25,30,['输入 p=(1,0)','先平移，再旋转：R T p','先旋转，再平移：T R p'][i],C.ink,17)+footer(['T=(2,0)，R=90°','最终 (0,3)','最终 (2,1)'][i]);}
function pivotFigure(i){const o=[70,211],c=[2,1],points=[[1,0],[0,1],[2,2]],target=points[i];let out=grid()+axes(...o,184)+label(...map2(target,o,49),'p′',C.mint);if(i===2)out+=label(...map2(c,o,49),'c',C.orange)+line(...map2(c,o,49),...map2(target,o,49),C.orange,2,'4 3');else out+=label(...o,'临时原点',C.orange);return out+text(24,31,['减去中心 c=(2,1)','绕临时原点旋转 90°','加回中心 c=(2,1)'][i],C.ink,17)+footer(['(3,1) → (1,0)','(1,0) → (0,1)','(0,1) → (2,2)'][i]);}
function rotatedCube(i){const angle=[0,45,90][i]*Math.PI/180,k=normalize([1,1,1]),points=[];for(let b=0;b<8;b++){const v=[b&1?.65:-.65,b&2?.65:-.65,b&4?.65:-.65],cross=[k[1]*v[2]-k[2]*v[1],k[2]*v[0]-k[0]*v[2],k[0]*v[1]-k[1]*v[0]],q=v.map((x,j)=>x*Math.cos(angle)+cross[j]*Math.sin(angle)+k[j]*dot(k,v)*(1-Math.cos(angle)));points.push(project3(q,76,[180,135]));}let out='';for(let b=0;b<8;b++)for(const bit of [1,2,4])if(!(b&bit))out+=line(...points[b],...points[b|bit],C.mint,2);return out+arrow(...project3(k.map(x=>-1.8*x),76,[180,135]),...project3(k.map(x=>1.8*x),76,[180,135]),C.orange)+text(25,32,'绕轴 (1,1,1) 旋转 '+[0,45,90][i]+'°',C.ink,18)+footer('轴上点保持不动');}
function cameraFigure(i){const o=[170,191],s=48,e=[2,1],target=[0,0],q=[-1,2],right=normalize([1,-2]),forward=normalize([-2,-1]);let positions;if(i===0)positions=[e,target,q];else if(i===1)positions=[[0,0],[-2,-1],[-3,1]];else positions=[[0,0],[0,Math.sqrt(5)],[dot(q.map((v,j)=>v-e[j]),right),dot(q.map((v,j)=>v-e[j]),forward)]];let out=grid();const a=map2(positions[0],o,s),b=map2(positions[1],o,s),c=map2(positions[2],o,s);out+=arrow(...a,...b,C.orange)+label(...a,'相机',C.orange)+label(...b,'目标',C.mint)+label(...c,'物体 P',C.blue);if(i===2)out+=arrow(...o,o[0]+100,o[1],C.muted)+text(282,194,'x',C.muted)+text(174,70,'−z',C.muted);return out+text(20,31,['世界空间 e=(2,1)','全部减 e，相机到原点','正交基点积，朝向 −z'][i],C.ink,17)+footer(['观察位置与物体一起平移','目标坐标 (−2,−1)','P 的横坐标 ≈ −2.236'][i]);}
function ortho(i){return (i===0?box3([-2,-1,-4],[2,1,-1],C.blue,29,[155,145]):i===1?box3([-2,-1,-1.5],[2,1,1.5],C.purple,42,[180,134]):box3([-1,-1,-1],[1,1,1],C.mint,66,[180,135]))+text(22,29,['原始正交观察体','先平移到中心','各轴缩放至标准体积'][i],C.ink,18)+footer(['x∈[−2,2]，y∈[−1,1]','深度中心 z=−2.5','x,y,z∈[−1,1]'][i]);}
function perspective(i){if(i===2)return rect(42,25,276,51,C.panel,C.purple,5)+text(180,57,'裁剪坐标 x=2，y=1，w=4',C.purple,17,'middle')+arrow(180,82,180,115,C.orange)+rect(80,126,200,96,C.panel,C.grid)+line(80,174,280,174,C.muted,1)+line(180,126,180,222,C.muted,1)+label(230,162,'(0.5,0.25)',C.mint)+footer('除以 w：x=2/4，y=1/4');const z=i===0?2:4,o=[35,142],f=75,x=o[0]+z*75,half=42,proj=half/z;return line(25,142,340,142,C.grid,1,'5 4')+circle(...o,5,C.orange)+line(110,42,110,225,C.purple,3)+line(x,142-half,x,142+half,C.blue,5)+line(...o,x,142-half,C.mint,1.8)+line(...o,x,142+half,C.mint,1.8)+line(110,142-proj,110,142+proj,C.mint,6)+text(70,32,'虚拟像平面',C.purple,16)+text(x-50,80,'z='+z,C.blue,17)+text(122,149-proj,'投影',C.mint,16)+footer('同一物体：投影高度 ∝ 1/z');}
function frustum(i){if(i===1)return rect(36,60,288,162,'#163442',C.mint)+rect(68,45,224,168,'none',C.orange)+text(180,31,'同一垂直 FOV 的画幅',C.ink,18,'middle')+text(80,100,'4 : 3',C.orange,19)+text(236,190,'16 : 9',C.mint,19)+footer('宽高比改变水平方向覆盖');
 if(i===2){const n=.1,f=100,depth=z=>f/(f-n)-f*n/((f-n)*z),values=Array.from({length:200},(_,j)=>{const z=n+(f-n)*j/199;return [40+z*2.8,212-depth(z)*164];});return axes(40,212,190)+polyline(values,C.mint)+text(30,34,'透视深度 d∈[0,1]',C.ink,18)+text(219,201,'距离 z',C.muted,16)+footer('d(1)≈0.901，d(10)≈0.991');}
 const f=80/Math.tan(Math.PI/6),o=[45,145],x=o[0]+f;return arrow(...o,x,145,C.muted)+line(...o,x,65,C.mint,2)+line(...o,x,225,C.mint,2)+line(x,65,x,225,C.purple,3)+text(72,112,'60°',C.mint,22)+text(231,138,'传感器',C.purple,17)+footer('固定画幅：焦距越短，视场越大');}
function pipeline(i){if(i===0)return cube(89,143,39)+arrow(142,143,198,143,C.orange)+cube(267,128,52)+text(88,39,'模型空间',C.muted,18,'middle')+text(266,39,'世界空间',C.ink,18,'middle')+footer('模型矩阵 M：形状、朝向、位置');
 if(i===1)return cameraFigure(2).replace('P 的横坐标 ≈ −2.236','视图 V → 投影 P → 齐次除法');
 return rect(52,27,256,192,C.panel,C.blue)+line(52,123,308,123,C.grid)+line(180,27,180,219,C.grid)+label(244,171,'像素 (480,120)',C.mint)+text(66,56,'640 × 480',C.blue,17)+footer('NDC (0.5,−0.5) → 视口；左下原点');}
function triangleSamples(i){const a=[65,211],b=[300,211],c=[155,45],q=[[175,137],[182,211],[302,106]][i];return grid()+polygon([a,b,c],'#163537',C.mint)+circle(...q,6,i===2?C.red:C.orange)+text(q[0]>250?222:q[0]+10,q[1]-10,'P',i===2?C.red:C.orange,17)+text(24,30,['内部点','边界点','外部点'][i],C.ink,20)+footer(['所有边函数同号','一个边函数为零','至少一个边函数符号相反'][i]);}
function frame(i){if(i===1){let out='';for(let x=0;x<4;x++)for(let j=0;j<3;j++)out+=rect(55+x*63+j*18,70,15,113,[C.red,C.mint,C.blue][j]);return out+text(180,42,'一个像素可由 RGB 子像素组成',C.ink,17,'middle')+footer('颜色由各通道的发光量共同决定');}
 if(i===2){let out='';for(let y=0;y<5;y++)for(let x=0;x<6;x++)out+=rect(65+x*36,207-(y+1)*32,33,29,x===1&&y===2?C.orange:C.panel,C.grid);return out+text(180,33,'W=6，H=5；y 从下向上',C.ink,17,'middle')+footer('(x,y)=(1,2) → yW+x=13');}
 return pixelTriangle(1).replace('16 列像素 · 中心覆盖测试','帧缓冲储存每个像素的颜色');}
function triangleKinds(i){if(i===0)return polygon([project3([-1,0,0]),project3([1,0,0]),project3([0,1,1])],'#183b3d',C.mint)+arrow(...project3([0,.35,.35]),...project3([0,1.3,-.6]),C.orange)+text(180,34,'三点定义一个平面',C.ink,20,'middle')+footer('非共线时：法线与绕序可确定');
 if(i===1){const points=[[60,210],[280,210],[280,130],[165,130],[165,55],[60,55]];return polygon(points,'#173a38',C.mint)+line(60,210,165,130,C.purple)+line(60,210,165,55,C.purple)+line(165,130,280,210,C.purple)+footer('非凸多边形也可三角剖分');}
 return polygon([[65,211],[300,211],[155,45]],'#213545',C.mint)+circle(65,211,9,C.red)+circle(300,211,9,C.mint)+circle(155,45,9,C.blue)+circle(174,152,10,'#9b9b9b')+line(174,152,65,211,C.red,1,'4 3')+line(174,152,300,211,C.mint,1,'4 3')+line(174,152,155,45,C.blue,1,'4 3')+footer('内部颜色可由三个顶点加权');}
function bbox(i){let out='';for(let y=0;y<5;y++)for(let x=0;x<6;x++){out+=rect(40+x*47,218-(y+1)*36,45,34,C.panel,C.grid);if(i===0||(i===1&&x>=2&&x<5&&y>=1&&y<4))out+=circle(63.5+x*47,200-y*36,3,C.purple);}out+=polygon([[134,182],[275,146],[181,74]],'none',C.mint);if(i===1)out+=rect(134,74,141,108,'none',C.orange);if(i===2)out+=circle(298.5,56,7,C.mint)+circle(336,56,7,C.red)+text(256,37,'x=5',C.mint,16)+text(318,81,'x=6',C.red,15);return out+footer(['扫描 6×5=30 个像素中心','只扫描包围盒内的 3×3=9 个中心','合法 (5,4)→29；x=6 越界'][i]);}
function coverage(i){const fraction=[.2,.6,1][i],x=85,y=43,w=190,h=166,cx=x+w/2,cy=y+h/2;return rect(x,y,w,h,C.panel,C.grid)+rect(x,y,w*fraction,h,'#357963')+line(x+w*fraction,y,x+w*fraction,y+h,C.mint,3)+circle(cx,cy,7,fraction>.5?C.blue:C.orange)+text(180,27,'一个像素的面积',C.ink,18,'middle')+text(180,228,'中心样本 = '+(fraction>.5?1:0),C.ink,17,'middle')+footer('真实覆盖率 = '+fraction*100+'%');}

export const foundationVisuals={
1:[
 make('几何、光和相机怎样共同得到一张图？',['几何输入','加入光照','离散图像'],['线段和三角面先描述物体的位置与形状。','同一球体的明暗取决于表面法线和灯光方向。','输出图像保存颜色采样，空间分辨率有限。'],i=>i===0?box3([-1,-1,-1],[1,1,1],C.mint,59,[180,135])+footer('形状先由几何数据描述'):i===1?sphere()+footer('根据法线计算 Lambert 明暗'):pixelTriangle(1)),
 make('哪些环节决定“长什么样”，哪些环节决定“怎么动”？',['两种成像路线','几何表示','动画状态'],['蓝色是视线，橙色是光线；光栅化还会把三角形覆盖到像素。','相同形状可以用点、边、面等表示，表示决定可执行的操作。','位置随时间变化；计算每帧状态后仍需要成像。'],i=>i===0?rayScene(1):i===1?box3([-1,-1,-1],[1,1,1],C.mint,55,[180,135])+footer('几何：建模、表示、处理'):shape(rot(30*i))+footer('动画：t=0 → t=1 → t=2')),
 make('从场景到图像与从图像猜场景，有什么不同？',['正向投影','观测到轮廓','逆向有多种解释'],['给定相机与三维物体，可以计算二维投影。','图像只保存观察方向上的信息，背面信息可能丢失。','近小与远大可具有相同高度/距离比，投影不能唯一恢复场景。'],i=>i===0?cube(110,139,42)+arrow(166,139,217,139,C.orange)+rect(249,98,64,77,C.panel,C.mint)+footer('场景、相机 → 图像'):i===1?polygon([[130,60],[225,60],[225,198],[130,198]],C.mint)+footer('单张图像只有一个视角'):circle(30,145,5,C.orange)+line(30,145,230,105,C.muted)+line(30,145,230,185,C.muted)+line(130,125,130,165,C.mint,8)+line(230,105,230,185,C.purple,8)+text(92,91,'近、小',C.mint,17)+text(207,74,'远、大',C.purple,17)+footer('高度 / 距离相同 → 投影相同')),
 make('提高像素数量，会消除哪些误差？',['低分辨率','中分辨率','更高分辨率'],['每个像素只能记录有限采样，斜边呈现明显阶梯。','增加采样让几何边界更细，但不会自动修复所有混叠。','像素变细后仍应考虑滤波、时间采样与有限精度。'],pixelTriangle),
 make('如果每帧计算时间翻倍，帧率会怎样变化？',['实时 60 FPS','实时 30 FPS','离线单帧'],['16.7 ms 左右需要完成一整帧；每项计算共享预算。','约 33.3 ms 每帧对应约 30 FPS，可以投入更多计算。','离线可以扩大单帧预算，但实际成本也受场景和算法影响。'],budget),
 make('能把“看上去合理”变成一个可以检查的预测吗？',['先预测','只改变旋转角','记录并比较'],['把单位正方形作为输入，先预测边和坐标轴会去哪里。','固定其他参数，把旋转角设成 30°，观察同一形状。','转到 90° 后可直接核对单位轴是否交换朝向。'],i=>shape(rot([0,30,90][i]))+footer('旋转角 = '+[0,30,90][i]+'°'))
],
2:[
 make('位置、位移和单位方向在图上怎样区分？',['点：描述位置','向量：可平移','归一化：保留方向'],['点 P 的坐标依赖原点。','箭头整体搬到另一处，位移和长度不变。','(3,4) 长度为 5；除以 5 后得到 (0.6,0.8)。'],pointVector),
 make('为什么朝反方向的投影是负数？',['同向：正投影','60°：一半投影','120°：负投影'],['两个单位向量同向，点积为 1。','橙色箭头是 b 在 a 上的投影，长度为 cos60°=0.5。','投影指向 a 的反方向，点积 cos120°=−0.5。'],dotFigure),
 make('交换两条边，为什么面积不变而法线翻转？',['有向面积','交换输入','共线退化'],['叉积同时记录平面方向与平行四边形面积。','a×b 与 b×a 互为相反向量，面积绝对值不变。','共线时面积和叉积都为零，不能直接生成单位法线。'],crossFigure),
 make('同一个点换一组基后，哪些量改变？',['标准基','旋转后的正交基','非正交基'],['系数为 (2,1)，与点积相同。','点的位置保持不变，新的坐标为 (2.121,−0.707)。','u=(1,0)、v=(0.6,0.8) 时点积不是坐标系数。'],basis),
 make('看矩阵的两列，能预测正方形如何变形吗？',['单位矩阵','横向拉伸','剪切'],['两列为 (1,0)、(0,1)，单位轴和正方形不变。','两列为 (2,0)、(0,1)，宽度变为原来的两倍。','两列为 (1,0)、(0.6,1)，原纵轴向右倾斜。'],i=>shape([[1,0,0,1],[2,0,0,1],[1,.6,0,1]][i],[70,208],90)+footer(['A 的列就是单位轴的像','面积扩大两倍','矩阵保持线性组合'][i])),
 make('非均匀缩放后，法线怎样继续保持垂直？',['原法线垂直','直接乘 A 出错','逆转置保持正交'],['t=(1,1) 与 n=(−1,1) 的点积为零。','A=diag(2,1) 把两个向量都拉伸，夹角不再是 90°。','逆转置得到 n′=(−0.5,1)，与 At=(2,1) 仍正交。'],normalFigure)
],
3:[
 make('只观察两条坐标轴的像，能读懂整个变换吗？',['非均匀缩放','剪切','反射'],['横轴拉伸两倍，纵轴保持长度。','纵轴向右偏移，正方形变成平行四边形。','横轴翻转，几何手性和顶点绕序也随之改变。'],i=>shape([[2,0,0,1],[1,.7,0,1],[-1,0,0,1]][i],[160,202],66)+footer(['列向量 (2,0)、(0,1)','列向量 (1,0)、(0.7,1)','列向量 (−1,0)、(0,1)'][i])),
 make('旋转 90° 后，原横轴和原纵轴分别在哪里？',['0°','45°','90°'],['单位横轴朝右、纵轴朝上。','两轴一起逆时针旋转，长度和夹角保持不变。','横轴成为 (0,1)，纵轴成为 (−1,0)。'],i=>shape(rot([0,45,90][i]),[167,194],98)+footer(['R(0) = I','旋转保持面积','R 的列：(0,1)、(−1,0)'][i])),
 make('同一平移矩阵，为什么会区别对待点与方向？',['点的齐次坐标','平移一个点','平移一个方向'],['最后一项 w=1，把平移列计入结果。','平移 (2,0) 使点从 (1,1) 到 (3,1)。','w=0 的方向没有位置，平移不会改变它。'],translateFigure),
 make('为什么 R T p 与 T R p 得到不同位置？',['同一个输入','先平移再旋转','先旋转再平移'],['输入 p=(1,0)，平移为 (2,0)，旋转为逆时针 90°。','p 先到 (3,0)，再绕原点到 (0,3)。','p 先到 (0,1)，再到 (2,1)。'],composeFigure),
 make('绕 c=(2,1) 旋转时，为什么要三步操作？',['中心移到原点','完成局部旋转','恢复世界位置'],['p=(3,1) 先减 c 得到 (1,0)。','围绕临时原点旋转 90°，得到 (0,1)。','加回 c 后最终位置为 (2,2)。'],pivotFigure),
 make('哪些三维变换会丢失信息，导致无法求逆？',['三维旋转','统一放大','压扁一个轴'],['旋转改变朝向，但可用相反旋转恢复原状。','所有轴乘 2，体积乘 8，仍然可逆。','z 轴乘 0，把不同深度投到同一平面，逆不存在。'],i=>(i===0?rotatedCube(1):i===1?box3([-1,-1,-1],[1,1,1],C.mint,60,[180,135])+footer('det(A)=8，体积放大 8 倍'):box3([-1,-1,0],[1,1,0],C.red,78,[180,135])+footer('det(A)=0，深度信息丢失')))
],
4:[
 make('物体绕任意轴转动时，什么部分保持不动？',['初始朝向','旋转 45°','旋转 90°'],['橙色箭头表示固定旋转轴，方框是三维立方体。','使用单位轴 k=(1,1,1)/√3 计算 Rodrigues 旋转。','沿轴分量不变，垂直轴的分量在平面内转动。'],rotatedCube),
 make('把相机搬回原点后，为什么还要重建坐标轴？',['原世界坐标','减相机位置','提取相机坐标'],['相机位置 e=(2,1)，朝目标 (0,0) 观察。','平移必须同时作用于场景，保持相对位置不变。','相机右向量点积给出横坐标，前向对齐到 −z。'],cameraFigure),
 make('正交投影怎样把观察体变成标准立方体？',['原观察体','移到中心','缩放每个轴'],['长方体各方向范围不同，必须分别计算中心和长度。','把 x、y、z 的区间中心都移到原点。','缩放后各轴都在 [−1,1]；深度符号遵循当前约定。'],ortho),
 make('同样大小的物体，放远一倍后投影有多高？',['物距 z=2','物距 z=4','齐次除法'],['虚拟像平面位于相机前方，投影三角形相似。','物距翻倍，投影高度变为一半。','矩阵保存齐次形式，最后除以 w 才得到二维比例。'],perspective),
 make('视场、画幅比例与深度分布，分别改变什么？',['垂直视场','宽高比','透视深度'],['固定传感器高度时，焦距和视场角通过正切关系联系。','相同垂直视场，宽画幅能看到更宽的水平方向。','n=0.1、f=100 的深度值大量集中在近处，远处差别被压缩。'],frustum),
 make('坐标在流水线的哪个阶段变成像素位置？',['模型 → 世界','世界 → 相机','NDC → 屏幕'],['模型矩阵先把局部形状放进世界。','视图矩阵换到相机坐标，再执行投影与齐次除法。','以左下为原点，NDC (0.5,−0.5) 在 640×480 视口变为 (480,120)。'],pipeline)
],
5:[
 make('坐标投影结束，为什么还要裁剪与覆盖测试？',['NDC 中的三角形','映射到视口','测试像素中心'],['连续坐标描述几何形状，还没有给每个像素写入颜色。','视口变换把标准坐标范围映射到有限屏幕范围。','边函数检查每个采样点是否位于三角形内部。'],i=>i===0?grid()+polygon([[60,207],[303,186],[170,44]],'#163d3f',C.mint)+footer('连续顶点坐标，尚未离散化'):i===1?rect(34,35,290,175,C.panel,C.blue)+polygon([[78,180],[292,169],[177,55]],'#163d3f',C.mint)+footer('标准范围 → 屏幕宽高'):pixelTriangle(1)),
 make('屏幕像素、RGB 子像素和帧缓冲地址是什么关系？',['像素颜色','RGB 发光通道','线性内存地址'],['图像存的是离散颜色样本，而不是一个连续表面。','示意的 RGB 子像素共同决定人眼看到的像素颜色。','宽度 W=6 时，像素 (1,2) 的零基地址为 13。'],frame),
 make('三角形为什么适合作为覆盖与插值的基本单位？',['非共线三点','多边形剖分','属性插值'],['三点确定平面，叉积可给出朝向。','复杂轮廓可以拆成若干三角形分别处理。','内部点的属性可由三个顶点的重心权重组合。'],triangleKinds),
 make('靠符号判断点的位置，如何避免只凭目测？',['内部','边界','外部'],['按一致绕序，三个边函数在内部保持同号。','边上的一个边函数为零，需要明确边界归属规则。','某个符号改变说明点位于对应边的外侧。'],triangleSamples),
 make('包围盒减少了多少候选测试？索引边界仍要检查什么？',['整个屏幕扫描','只看包围盒','索引安全'],['6×5 屏幕共有 30 个中心候选。','该例包围盒只需测试 9 个中心，真正覆盖仍由三角形判定。','x 必须小于 W；合法最后像素地址为 29，x=6 越界。'],bbox),
 make('中心样本相同的两个像素，真实覆盖面积会相同吗？',['20% 覆盖','60% 覆盖','100% 覆盖'],['中心落在外部，单次采样给 0，却遗漏了 20% 的覆盖。','中心落在内部，单次采样给 1，但真实覆盖只为 60%。','全部覆盖时中心采样才与面积平均一致。'],coverage)
]};
