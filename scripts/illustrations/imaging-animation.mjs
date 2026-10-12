import {C,text,line,arrow,rect,circle,polygon,polyline,path,grid,bezier,panel,group} from './primitives.mjs';

// Original teaching diagrams. Curves and numerical tables are generated from
// the equations stated in each caption; schematic optical/colour models are
// deliberately labelled rather than presented as a complete physical model.
const B=s=>text(180,247,s,C.mint,16,'middle');
const P=(title,caption,svg,note)=>panel(title,caption,svg+B(note));
const seq=(n,f)=>Array.from({length:n},(_,i)=>f(i,n));
const fmt=(v,n=3)=>Number(v.toFixed(n)).toString();
function chart(series,{xmin=0,xmax=1,ymin=0,ymax=1,xlabel='t',ylabel='值',labels=true}={}){
 const X=v=>45+270*(v-xmin)/(xmax-xmin),Y=v=>205-150*(v-ymin)/(ymax-ymin);let s=grid(45,55,270,150,30)+line(45,205,315,205,C.muted)+line(45,55,45,205,C.muted);
 if(labels)s+=text(315,225,xlabel,C.muted,16,'end')+text(25,48,ylabel,C.muted,16)+text(43,225,fmt(xmin,2),C.muted,16)+text(45,53,fmt(ymax,2),C.muted,16);
 for(const a of series)s+=polyline(a.points.map(([x,y])=>[X(x),Y(y)]),a.color||C.mint,a.width||2.6,a.dash||'');
 return s;
}
const curves=(fs,n=101)=>fs.map(([f,color])=>({points:seq(n,i=>[i/(n-1),f(i/(n-1))]),color}));
function camera(mode){let s=text(25,25,mode==='bare'?'传感器混合各方向':mode==='pinhole'?'一个孔限制方向':'同一点的光线会聚',C.ink,17)+line(290,48,290,215,C.blue,4)+text(246,42,'感光面',C.blue,16);const obj=[[42,70,C.orange],[42,175,C.purple]];
 for(const [x,y,c] of obj){s+=circle(x,y,6,c);if(mode==='bare')for(const end of [90,130,170])s+=line(x,y,290,end,c,1.7);
 else if(mode==='pinhole'){const ey=130+(130-y)*(290-180)/(180-x);s+=line(x,y,180,130,c,2)+line(180,130,290,ey,c,2)+circle(290,ey,4,c);}
 else{const ey=130+(130-y)*(290-180)/(180-x);for(const h of [80,130,180])s+=line(x,y,180,h,c,1.7)+line(180,h,290,ey,c,1.7);s+=circle(290,ey,4,c);}}
 if(mode==='pinhole')s+=line(180,48,180,124,C.muted,6)+line(180,136,180,215,C.muted,6)+text(158,42,'针孔',C.muted,16);
 if(mode==='lens')s+=path('M180 55 Q159 130 180 205 Q201 130 180 55',C.mint,'none',3)+text(152,43,'透镜',C.mint,16);
 return s;
}
function fov(f,sensor){const x=65+f*4,h=sensor*2,theta=2*Math.atan(sensor/(2*f))*180/Math.PI;return text(24,26,`f=${f} mm，s=${sensor} mm`,C.ink,17)+line(45,132,320,132,C.grid,1,'4 4')+polygon([[65,132],[x,132-h],[x,132+h]],C.panel,C.mint)+circle(65,132,5,C.orange)+line(x,132-h,x,132+h,C.blue,4)+text(x+10,132,'s',C.blue,17)+text((65+x)/2,154,'f',C.orange,17)+text(72,86,`${theta.toFixed(2)}°`,C.mint,17);}
function exposure(n,t,iso){const light=t/(n*n),relative=light/(.01/(2.8*2.8));return text(25,25,`f/${n} · ${t===.01?'1/100':'1/50'} s · ISO ${iso}`,C.ink,17)+text(25,63,'光子收集',C.muted,16)+rect(125,44,Math.min(180,relative*150),26,C.mint)+text(25,110,'输出增益',C.muted,16)+rect(125,91,iso/100*75,26,C.purple)+text(25,151,'物体投影速度 100 px/s',C.muted,16)+line(55,184,55+100*t*70,184,C.orange,15)+circle(55,184,6,C.ink)+text(55,218,`轨迹长度 ${fmt(100*t,1)} px`,C.orange,17);}
function lens(u,f=50){const v=f*u/(u-f),scale=Math.min(120/u,125/Math.abs(v)),cx=175,cy=135,h=50,ox=cx-u*scale,ix=cx+v*scale,ih=-v/u*h;let s=text(20,25,`f=${f}，u=${u}，v=${fmt(v,2)} mm`,C.ink,17)+line(28,cy,330,cy,C.muted,1,'4 4')+line(cx,50,cx,211,C.blue,4)+arrow(ox,cy,ox,cy-h,C.orange)+circle(cx+f*scale,cy,4,C.mint)+text(cx+f*scale-8,cy+22,'F',C.mint,16)+line(ox,cy-h,cx,cy-h,C.orange,2)+line(ox,cy-h,cx,cy,C.purple,2);
 if(v>0)s+=line(cx,cy-h,ix,cy-ih,C.orange,2)+line(cx,cy,ix,cy-ih,C.purple,2)+arrow(ix,cy,ix,cy-ih,C.mint);
 else{const end=cx+Math.min(150,70*u*scale/h);s+=line(cx,cy-h,325,cy-h+(325-cx)*h/(f*scale),C.orange,2)+line(cx,cy,end,cy+(end-cx)*h/(u*scale),C.purple,2);s+=line(ix,cy-ih,cx,cy-h,C.orange,2,'4 4')+line(ix,cy-ih,cx,cy,C.purple,2,'4 4')+arrow(ix,cy,ix,cy-ih,C.mint);}
 return s;
}
function coc(D,vf,vo){const ox=60,cy=132,k=2.7,ix=ox+vo*k,sx=ox+vf*k,h=D*3,c=D*Math.abs(1-vf/vo);return text(20,26,`D=${D}，vₒ=${vo}，v𝒻=${vf} mm`,C.ink,17)+line(32,cy,325,cy,C.muted,1,'4 4')+line(ox,cy-h,ox,cy+h,C.blue,5)+line(ox,cy-h,ix,cy,C.orange)+line(ox,cy+h,ix,cy,C.orange)+line(sx,48,sx,214,C.purple,3)+line(sx,cy-c*3,sx,cy+c*3,C.mint,7)+circle(ix,cy,4,C.orange)+text(26,63,'孔径',C.blue,16)+text(sx-24,44,'传感器',C.purple,16)+text(ix-22,218,'像点',C.orange,16);}
function depth(N,cmax=.03){const f=50,uf=2000,D=f/N,vf=f*uf/(uf-f);const delta=cmax/(D*vf),near=1/(1/uf+delta),far=1/(1/uf-delta);let s=text(20,25,`f=50 mm，u𝒻=2000 mm，f/${N}`,C.ink,17)+chart([{points:seq(101,i=>{const u=1400+1600*i/100;return[u/1000,D*vf*Math.abs(1/u-1/uf)];}),color:C.blue},{points:[[1.4,cmax],[3,cmax]],color:C.orange,dash:'5 4'}],{xmin:1.4,xmax:3,ymin:0,ymax:.14,xlabel:'物距 / m',ylabel:'c / mm'});
 const X=u=>45+270*(u/1000-1.4)/1.6;s+=rect(X(near),202,X(far)-X(near),5,C.mint)+text(170,43,`阈值 ${cmax} mm`,C.orange,16);return {svg:s,near,far};}
function disk(correct){let s=circle(180,129,82,C.panel,C.muted)+circle(180,129,41,'none',C.orange,2);for(let i=0;i<96;i++){const q=(i+.5)/96,r=82*(correct?Math.sqrt(q):q),a=i*Math.PI*(3-Math.sqrt(5));s+=circle(180+r*Math.cos(a),129+r*Math.sin(a),2.2,C.mint);}return s+text(20,25,correct?'r = R√ξ：按面积分配':'r = Rξ：中心过密',C.ink,17)+text(22,224,'橙圈：半径 R/2',C.orange,16);}
function lf(refocus=0){let s=text(20,25,refocus?'按目标深度平移子视图':'各孔径位置看到的子视图',C.ink,17);for(let j=0;j<3;j++){const a=j-1,y=65+j*57;s+=text(15,y+12,`u=${a}`,C.muted,16)+rect(68,y-17,258,35,C.panel);const x1=170+a*22-refocus*a*22,x2=256+a*7-refocus*a*22;s+=circle(x1,y,8,C.mint)+circle(x2,y,8,C.orange);}return s+text(72,227,'绿：近点     橙：远点',C.muted,16);}
function spectrum(values,color=C.mint){const pts=values.map((v,i)=>[400+i*100,v]);return chart([{points:pts,color}],{xmin:400,xmax:700,ymin:0,ymax:2.2,xlabel:'波长 / nm',ylabel:'示意能量'});}
function triResponse(values){const q=[[1,.5,0,0],[0,.5,.5,0],[0,0,.5,1]],r=q.map(a=>a.reduce((sum,v,i)=>sum+v*values[i],0));let s=text(18,25,'三通道离散响应模型',C.ink,17);r.forEach((v,i)=>{s+=text(24,80+i*49,['S′','M′','L′'][i],C.muted,17)+rect(65,60+i*49,v*110,26,[C.blue,C.mint,C.orange][i])+text(70+v*110,80+i*49,fmt(v),C.ink,16);});return s;}
const srgb=v=>v<=.0031308?12.92*v:1.055*Math.pow(v,1/2.4)-.055;
const lin=v=>v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);
function gray(value,label){const h=Math.round(value*255).toString(16).padStart(2,'0');return rect(65,58,230,146,`#${h}${h}${h}`)+text(20,25,label,C.ink,17)+text(180,225,`屏幕编码 ${fmt(value,3)}`,C.ink,17,'middle');}
function chromatic(X,Y,Z){const total=X+Y+Z,x=X/total,y=Y/total;return chart([],{xmin:0,xmax:.8,ymin:0,ymax:.8,xlabel:'x',ylabel:'y'})+polygon([[45+270*.64/.8,205-150*.33/.8],[45+270*.3/.8,205-150*.6/.8],[45+270*.15/.8,205-150*.06/.8]],C.panel,C.blue)+circle(45+270*x/.8,205-150*y/.8,7,C.mint)+text(20,26,`XYZ = (${X}, ${Y}, ${Z})`,C.ink,17)+text(180,44,'三角形：sRGB 基色色域',C.muted,16);}
function arm(t1,t2,target=null,color=C.mint,lengths=[1,1]){const scale=60,o=[150,170],a=[o[0]+scale*lengths[0]*Math.cos(t1),o[1]-scale*lengths[0]*Math.sin(t1)],b=[a[0]+scale*lengths[1]*Math.cos(t1+t2),a[1]-scale*lengths[1]*Math.sin(t1+t2)];let s=grid(30,50,300,150,30)+polyline([o,a,b],color,8)+circle(...o,7,C.ink)+circle(...a,6,C.orange)+circle(...b,6,color);if(target)s+=circle(o[0]+scale*target[0],o[1]-scale*target[1],10,'none',C.purple,2);return s;}
function spring(length){const x=65,y=126,k=10,l0=1,scale=90,end=x+length*scale;let pts=[[x,y]];for(let i=1;i<=12;i++)pts.push([x+i*(end-x)/13,y+(i%2?13:-13)]);pts.push([end,y]);const F=k*(length-l0);return text(20,25,`ℓ=${length} m，ℓ₀=1 m，k=10`,C.ink,17)+polyline(pts,C.mint,3)+circle(x,y,12,C.blue)+circle(end,y,12,C.orange)+(F?arrow(x,y-42,x+Math.sign(F)*40,y-42,C.blue)+arrow(end,y+42,end-Math.sign(F)*40,y+42,C.orange):text(132,179,'两端弹力为零',C.muted,17))+text(35,218,`Fₐ=${fmt(F)} N，Fᵦ=${fmt(-F)} N`,C.ink,17);}
function oscillator(method,h,steps,k=4){let x=1,v=0,xp=1-.5*k*h*h;const result=[[0,x,v,.5*k]];for(let i=1;i<=steps;i++){if(method==='explicit')[x,v]=[x+h*v,v-h*k*x];else if(method==='implicit')[x,v]=[(x+h*v)/(1+k*h*h),(v-h*k*x)/(1+k*h*h)];else if(method==='midpoint'){const xm=x+h*v/2,vm=v-h*k*x/2;[x,v]=[x+h*vm,v-h*k*xm];}else if(method==='verlet'){const xn=2*x-xp-k*x*h*h;v=(xn-x)/h-.5*k*xn*h;xp=x;x=xn;}else{v-=h*k*x;x+=h*v;}result.push([i*h,x,v,(v*v+k*x*x)/2]);}return result;}
function energy(method,h,seconds=3){const result=oscillator(method,h,Math.round(seconds/h)),e=result.at(-1)[3],max=Math.max(2.5,...result.map(r=>r[3]));return {svg:text(20,25,`${method}，h=${h} s`,C.ink,17)+chart([{points:result.map(r=>[r[0],r[3]]),color:C.mint},{points:[[0,2],[seconds,2]],color:C.orange,dash:'4 4'}],{xmin:0,xmax:seconds,ymin:0,ymax:max,xlabel:'t / s',ylabel:'E / J'}),e};}
function particles(step=0){let s=grid(35,48,285,150,35);for(let i=0;i<12;i++){const x=56+(i%4)*68+step*8,y=77+Math.floor(i/4)*47-step*5;s+=circle(x,y,6,[C.mint,C.blue,C.orange][i%3]);if(step)s+=arrow(x-15,y+8,x+11,y-6,C.muted,1.5);}return s;}

export const imagingAnimationVisuals={
19:[
 group('哪些结构让一个物点与一个感光位置建立对应？',
  P('裸传感器：方向混合','追踪两种颜色到同一感光位置的路径；仅增加信号不能分离来源。',camera('bare'),'同一数值可含多个方向'),
  P('针孔：倒立映射','两条中心射线穿过小孔；物点越高，像点越低。图中仅展示几何针孔。',camera('pinhole'),'限制方向，牺牲进光量'),
  P('薄透镜：多线会聚','来自同一物点的三条光线在正确像面汇合；中心射线保持直线，其他射线由透镜折向同一像点。',camera('lens'),'方向对应与收光量是两件事')),
 group('固定机位时，传感器尺寸与焦距怎样共同决定取景？',
  P('36 mm / 50 mm','在远距离对焦近似下，从感光面边缘画出两条极限射线。',fov(50,36),'水平 FOV ≈ 39.60°'),
  P('36 mm / 25 mm','保持感光面宽度，把焦距减半；半角由 s/(2f) 决定。',fov(25,36),'水平 FOV ≈ 71.51°'),
  P('18 mm / 50 mm','保持机位与焦距，只截取较小感光面；裁切不等于移动相机。',fov(50,18),'水平 FOV ≈ 20.41°')),
 group('同样画面亮度是否意味着收集相同光子与运动轨迹？',
  P('基准曝光','光子条以固定照明、同一镜头近似 T/N² 标定；运动轨迹按 100 px/s 计算。',exposure(2.8,.01,100),'基准光量 1；轨迹 1 px'),
  P('收光圈，延长快门','光圈 f/4、快门 1/50 s 的相对光量约 0.98；运动积分时间加倍。',exposure(4,.02,100),'光量约相同；轨迹 2 px'),
  P('收光圈，提高 ISO','快门仍为 1/100 s，光子数约为基准 0.49；ISO 200 仅把此图增益加倍。',exposure(4,.01,200),'增益补亮，不补收集光子')),
 group('物距变化时，像距为何不能始终等于焦距？',
  P('物距 200 mm','近轴薄透镜，两条主光线求交；长度单位一致。图形按参数调整尺度。',lens(200),'v ≈ 66.67 mm，倒立实像'),
  P('物距 100 mm','物体位于两倍焦距，像距也是两倍焦距；像高绝对值等于物高。',lens(100),'u=v=100 mm，|m|=1'),
  P('物体进入焦点内','实线沿实际传播方向发散，虚线反向延长到虚像；虚像不能投到后方传感器。',lens(25),'v=−50 mm，正立虚像')),
 group('收小孔径和移动传感器，分别改变弥散圆的哪一项？',
  P('提前截断光锥','像点在 60 mm，传感器在 50 mm；绿段为光锥截面的弥散圆直径。',coc(10,50,60),'c=10×|1−50/60|≈1.67 mm'),
  P('孔径减半','像点和传感器保持不变，孔径直径从 10 减为 5 mm；会聚位置不移动。',coc(5,50,60),'c≈0.83 mm，像距不变'),
  P('传感器移至像点','相同物点和孔径，传感器落在会聚位置；此处只讨论几何离焦。',coc(10,60,60),'理想离焦 c=0')),
 group('清晰区间怎样随光圈与允许弥散圆改变？',
  (()=>{const d=depth(4);return P('f/4 与固定阈值','蓝线用 c=Dv𝒻|1/u−1/u𝒻| 计算；橙虚线为阈值，绿段表示满足阈值的区间。',d.svg,`${fmt(d.near)}–${fmt(d.far)} mm`);})(),
  (()=>{const d=depth(8);return P('f/8：光锥更窄','孔径直径减半，所有物距的几何离焦也减半；这不包含衍射限制。',d.svg,`${fmt(d.near)}–${fmt(d.far)} mm`);})(),
  (()=>{const d=depth(4,.015);return P('放大观看：阈值更严','仍用 f/4，但允许光斑直径减半；成像相同，可接受标准改变。',d.svg,`${fmt(d.near)}–${fmt(d.far)} mm`);})()),
 group('怎样让孔径采样均匀覆盖面积，而不是偏向中心？',
  P('正确：均匀面积','96 个确定性分层示意样本，半径按平方根变换；橙圈包含约四分之一。',disk(true),'R/2 内面积占 25%'),
  P('反例：均匀半径','相同角度序列与样本数，只改为均匀半径；中心区获得约一半样本。',disk(false),'R/2 内样本占 50%'),
  P('射线对准同一焦点','三种孔径起点都指向场景侧对焦点；前后深度截面仍产生不同交点。',text(20,25,'镜头采样 → 场景对焦点',C.ink,17)+line(65,65,65,208,C.blue,4)+line(260,55,260,214,C.purple,2)+line(155,55,155,214,C.grid,2,'4 4')+[80,132,184].map(y=>line(65,y,260,132,C.mint)+circle(65,y,4,C.orange)).join('')+circle(260,132,6,C.orange)+text(225,44,'对焦面',C.purple,16)+text(113,44,'前景面',C.muted,16),'焦点会聚；其他深度有视差'))
],
20:[
 group('光场的四维来自什么假设，哪些维度被固定或积分掉？',
  P('七维条件清单','位置三维、方向二维，加波长与时间；每个彩色框表示一类变量。',[['位置 x,y,z',C.blue],['方向 θ,φ',C.mint],['波长 λ',C.orange],['时间 τ',C.purple]].map(([t,c],i)=>rect(45,40+i*43,270,33,C.panel,c,5)+text(180,63+i*43,t,c,17,'middle')).join(''),'3+2+1+1=7 维'),
  P('双平面标定一条射线','四维表示使用两个平面上的两对交点坐标；这里仅画 u–s 二维截面。',line(85,48,85,205,C.blue,3)+line(275,48,275,205,C.purple,3)+line(40,190,320,60,C.mint,3)+circle(85,169.11,5,C.orange)+circle(275,80.89,5,C.orange)+text(60,35,'(u,v)',C.blue,17)+text(249,35,'(s,t)',C.purple,17)+text(20,225,'沿射线移动：辐亮度不变',C.muted,16),'无吸收散射区域才能降维'),
  P('雾中：沿线不再相同','示意介质吸收 L(d)=L₀e⁻ᵈ；沿同一射线的位置成为独立条件，不能直接沿用自由空间降维。',chart(curves([[t=>Math.exp(-2*t),C.orange]]),{xlabel:'距离 d',ylabel:'L/L₀'})+text(90,35,'示例：衰减系数 2',C.muted,16),'L(1)/L₀=e⁻²≈0.135')),
 group('对齐不同子视图，为何只让某一深度清楚？',
  P('原始子视图','近景绿点的视差斜率更大；每行代表一个孔径位置，不是连续视频帧。',lf(0),'视差量与深度有关'),
  P('对齐近景','每行按绿点对应的深度平移；绿点重合，橙点在求和后会展开。',lf(1),'近景对齐，远景仍错位'),
  P('空间与角度预算','同一 16×12 样本预算：普通图像全部用于空间；光场把每块 2×2 用于角度。',text(20,25,'固定总样本：192',C.ink,17)+seq(12,i=>seq(16,j=>rect(28+j*9,55+i*10,8,9,(i+j)%2?C.blue:C.panel)).join('')).join('')+seq(6,i=>seq(8,j=>rect(206+j*14,65+i*19,12,17,[C.mint,C.orange,C.purple,C.blue][(i+j)%4])).join('')).join('')+text(27,202,'16×12 空间',C.blue,16)+text(197,202,'8×6 ×4 角度',C.mint,16),'保存方向通常牺牲空间细节')),
 group('为什么 RGB 不能完整记录照明与材料的光谱？',
  P('连续宽带光源','用四个波长采样展示宽带分布；连线只作采样间的示意，不代表测量灯具。',spectrum([1,1.3,1.2,.9]),'光谱：随波长变化的能量'),
  P('另一种光源','相同绘图尺度，能量集中在不同波段；颜色名无法描述所有这些变化。',spectrum([.2,2,.2,1.6],C.orange),'照明谱形改变'),
  P('照明乘反射率','蓝色光源样本 [1,1.3,1.2,0.9] 与反射率 [0.2,0.3,0.8,0.9] 逐项相乘，得到出射示意谱。',chart([{points:[[400,1],[500,1.3],[600,1.2],[700,.9]],color:C.blue},{points:[[400,.2],[500,.39],[600,.96],[700,.81]],color:C.mint}],{xmin:400,xmax:700,ymin:0,ymax:2.2,xlabel:'波长 / nm',ylabel:'能量'})+text(20,25,'蓝：照明    绿：反射后',C.ink,17),'S出射 = S照明 × ρ(λ)')),
 group('不同光谱怎样得到同样三个响应值？',
  P('光谱 A：四个采样值','离散教学模型的光谱 A=[1,1,1,1]；不把四个采样点当作真实完整人眼模型。',spectrum([1,1,1,1]),'A=[1, 1, 1, 1]'),
  P('光谱 B：谱形不同','光谱 B=[0.5,2,0,1.5]；与 A 的差位于此三响应矩阵的零空间。',spectrum([.5,2,0,1.5],C.orange),'B=[0.5, 2, 0, 1.5]'),
  P('三响应完全相同','本图采用 qS′=[1,.5,0,0]、qM′=[0,.5,.5,0]、qL′=[0,0,.5,1]；分别点乘两个光谱。',triResponse([1,1,1,1]),'A 与 B 都得到 (1.5,1,1.5)')),
 group('归一化去掉了什么，显示器色域又限制了什么？',
  P('XYZ 归一化','XYZ=(2,3,5)，总和 10，点的位置为 x=0.2、y=0.3；三角形仅示 sRGB 基色色域。',chromatic(2,3,5),'x=0.2，y=0.3，Y=3'),
  P('整体光量乘四','XYZ 同比放大为 (8,12,20)，色度点不动，但亮度相关量 Y 增加四倍。',chromatic(8,12,20),'x=0.2，y=0.3，Y=12'),
  P('超出基色正混合范围','采用 XYZ=(1,8,1)，y=0.8 的点位于三角形外；图中没有把色度边界当完整可见光谱轨迹。',chromatic(1,8,1),'三基色正混合有有限色域')),
 group('为什么黑白平均必须先回到线性光？',
  P('直接平均编码值','sRGB 黑 0 与白 1 的编码平均是 0.5；用标准分段公式解码，线性光仅约 0.214。',gray(.5,'错误计算域：(0+1)/2'),'线性光 ≈ 0.214'),
  P('先平均线性光再编码','线性光平均为 0.5，再用 sRGB 分段函数编码为约 0.735；灰块按此编码显示。',gray(srgb(.5),'正确计算域：平均光能'),'线性 0.5 → 编码 0.735'),
  P('传递函数不是直线','绿线是标准 sRGB 编码，橙虚线为 y=x；同样线性能量对应的代码值不同。',chart(curves([[srgb,C.mint],[t=>t,C.orange]]),{xlabel:'线性光',ylabel:'sRGB 编码'})+text(155,40,'计算前解码',C.muted,16),'非线性编码与平均不可交换')),
 group('选色坐标的距离与人眼感受为何不能直接画等号？',
  P('HSV 环：操作方便','纯色圆环显示 H 的循环变化；固定 S=1、V=1。坐标组织颜色，不证明等距离等感知。',seq(12,i=>{const colors=['#ff0000','#ff8000','#ffff00','#80ff00','#00ff00','#00ff80','#00ffff','#0080ff','#0000ff','#8000ff','#ff00ff','#ff0080'];const a=i*Math.PI/6;return circle(180+75*Math.cos(a),130+75*Math.sin(a),18,colors[i]);}).join('')+circle(180,130,38,C.panel)+text(180,136,'H',C.ink,18,'middle'),'相邻色块不保证等感知差'),
  P('Lab 距离的条件','两个示例 Lab 点 (50,20,10) 与 (50,23,14)，欧氏距离为 5；这种近似仍依赖标准观察条件。',line(65,190,300,190,C.muted)+line(65,190,65,55,C.muted)+circle(125,145,7,C.mint)+circle(215,85,7,C.orange)+arrow(133,139,207,91,C.purple)+text(78,218,'a*',C.muted,16)+text(35,60,'b*',C.muted,16)+text(100,45,'Δa*=3，Δb*=4',C.ink,17),'ΔE₇₆ = √(3²+4²)=5'),
  P('同一灰块，不同背景','中央两个方块均为编码 #808080；周围背景分别是深灰与浅灰。请比较感受再核对值。',rect(20,48,155,160,'#222222')+rect(185,48,155,160,'#dddddd')+rect(65,95,65,65,'#808080')+rect(230,95,65,65,'#808080')+text(20,25,'中心块数值完全相同',C.ink,17),'上下文影响明暗判断')),
 group('发光相加与材料吸收为什么需要不同模型？',
  P('加色：能量相加','简化三离散波段中，红 [1,0,0] 加绿 [0,1,0] 得 [1,1,0]，示意黄色发光。',rect(35,70,80,95,'#ff0000')+text(131,123,'+',C.ink,24)+rect(165,70,80,95,'#00ff00')+text(269,123,'=',C.ink,24)+rect(302,70,35,95,'#ffff00')+text(20,28,'红光 + 绿光',C.ink,17),'无光是黑；三通道相加是白'),
  P('减色：逐波段透射','理想滤色示意：青透射 [0,1,1]、黄透射 [1,1,0]，逐项相乘得到 [0,1,0]。实际油墨更复杂。',rect(34,70,85,95,'#00ffff')+text(132,123,'×',C.ink,24)+rect(166,70,85,95,'#ffff00')+text(271,123,'=',C.ink,24)+rect(301,70,37,95,'#00ff00')+text(20,28,'青滤色 × 黄滤色',C.ink,17),'从白光减去被吸收波段'),
  P('照明是减色的输入','同一青滤色率 [0,1,1]：白光 [1,1,1] 输出青；只有红光 [1,0,0] 输入时输出全零。',text(20,28,'相同材料，不同照明',C.ink,17)+rect(30,55,70,50,'#ffffff')+arrow(114,79,160,79,C.muted)+rect(177,55,65,50,'#00ffff')+arrow(253,79,298,79,C.muted)+rect(309,55,30,50,'#00ffff')+rect(30,149,70,50,'#ff0000')+arrow(114,173,160,173,C.muted)+rect(177,149,65,50,'#00ffff')+arrow(253,173,298,173,C.muted)+rect(309,149,30,50,'#000000',C.muted),'颜色结果依赖光源谱'))
],
21:[
 group('连续位置与连续速度，分别怎样体现在动画曲线上？',
  P('线性关键帧','位置 p=s=t，端点外保持不动；中段速度为 1，到端点会突然切换。',chart(curves([[t=>t,C.blue]]),{xlabel:'归一化 t',ylabel:'位置 p'})+text(20,25,'p(0)=0，p(1)=1',C.ink,17),'中段恒速，起停速度突变'),
  P('缓入缓出','s(t)=3t²−2t³；位置端点相同，但首尾切线斜率为零。',chart(curves([[t=>3*t*t-2*t*t*t,C.mint],[t=>t,C.blue]]),{xlabel:'归一化 t',ylabel:'位置 p'})+text(20,25,'绿：Smoothstep；蓝：线性',C.ink,17),'改变节奏，不添加真实阻力'),
  P('检查速度曲线','绘制 s′=6t−6t²，峰值在中间为 1.5，两个端点速度为零。',chart(curves([[t=>6*t-6*t*t,C.orange]]),{ymax:1.6,xlabel:'归一化 t',ylabel:'速度 ds/dt'})+text(20,25,'由位置曲线求导',C.ink,17),'位置平滑需同时看导数')),
 group('质量、力和时间步各在哪个环节进入运动？',
  P('同力，不同质量','两物体均受 6 N：质量 2 kg 加速度 3 m/s²，质量 3 kg 加速度 2 m/s²。箭头长度表示加速度。',circle(75,95,19,C.blue)+arrow(107,95,267,95,C.mint)+text(30,62,'m=2，a=3',C.ink,17)+circle(75,182,26,C.orange)+arrow(112,182,219,182,C.mint)+text(30,145,'m=3，a=2',C.ink,17),'a=F/m，质量不等于阻力'),
  P('力先改变速度','质量 2 kg，常力 6 N，从静止开始；解析速度 v(t)=3t。',chart(curves([[t=>3*t,C.mint]]),{ymax:3,xlabel:'t / s',ylabel:'v / m·s⁻¹'})+text(20,25,'F=6 N，m=2 kg',C.ink,17),'1 秒后速度 3 m/s'),
  P('速度再积成位置','同一匀加速系统从 x=0 起，解析位置 x(t)=1.5t²；并非 x=F/m。',chart(curves([[t=>1.5*t*t,C.orange]]),{ymax:1.5,xlabel:'t / s',ylabel:'x / m'})+text(20,25,'x₀=0，v₀=0',C.ink,17),'1 秒后位移 1.5 m')),
 group('弹簧被拉长、压短或恰好静止时，两端力的符号怎样变？',
  P('拉长到 1.5 m','左端受力朝右，右端受力朝左；恢复力使长度回到静止长度。',spring(1.5),'Δℓ=+0.5 → |F|=5 N'),
  P('压短到 0.7 m','恢复力方向反转，使两端向外分离；不能把相反力画成同向。',spring(.7),'Δℓ=−0.3 → |F|=3 N'),
  P('静止长度 1 m','无阻尼且不计外力时，此配置应不自行运动，可作为代码平衡测试。',spring(1),'内部弹力总和恒为 0')),
 group('共同平移、相对运动和剪切为何要分开检查？',
  P('共同平移无内部阻尼','端点速度均为 3 m/s；差为零，内部弹簧阻尼为零，全局 −cv 阻尼却非零。',line(65,140,275,140,C.mint,3)+circle(65,140,9,C.blue)+circle(275,140,9,C.orange)+arrow(65,105,126,105,C.blue)+arrow(275,105,336,105,C.orange)+text(20,45,'vₐ=vᵦ=(3,0)',C.ink,17)+text(85,193,'vᵦ−vₐ=0',C.muted,17),'内部阻尼不阻止共同平移'),
  P('沿轴分离会耗能','左端速度 −1、右端 +1 m/s，d̂=(1,0)、c=1：左端阻尼力 +2、右端 −2 N。',line(80,135,275,135,C.mint,3)+circle(80,135,9,C.blue)+circle(275,135,9,C.orange)+arrow(80,90,38,90,C.blue)+arrow(275,90,317,90,C.orange)+arrow(80,178,139,178,C.purple)+arrow(275,178,216,178,C.purple)+text(20,35,'上：速度；下：阻尼力',C.ink,17),'相对速度投影 = 2 m/s'),
  P('仅边弹簧抵抗不了剪切','橙色菱形四条边均长 90，相比绿色正方形对角线改变；加入斜向连接产生恢复剪切的力。',polygon([[65,65],[155,65],[155,155],[65,155]],'none',C.mint)+polygon([[214,65],[304,65],[340,147.49],[250,147.49]],'none',C.orange)+line(214,65,340,147.49,C.purple,2,'4 4')+text(40,201,'边长不变',C.mint,17)+text(213,201,'对角线改变',C.purple,16),'结构连接决定变形刚度')),
 group('粒子是表示方法；生成、邻居规则与物理模型各负责什么？',
  P('生成与状态','12 个粒子携带位置与速度；粒子不是天然完整流体，每种用途还需定义力与寿命。',particles()+text(20,25,'粒子状态：位置、速度、寿命',C.ink,17),'更新前：明确模型与单位'),
  P('推进与边界','画出示意统一速度 (8,5) 像素/步，箭头显示运动方向；这是一种运动规则而非流体求解。',particles(1)+text(20,25,'位置随速度推进',C.ink,17),'推进后还需碰撞与移除规则'),
  P('邻居查询成本','朴素两两检查对数 n(n−1)/2；空间网格可减少候选，但效果依赖分布与交互半径。',chart([{points:[10,20,30,40,50,60,70,80,90,100].map(n=>[n,n*(n-1)/2]),color:C.orange}],{xmin:10,xmax:100,ymax:5000,xlabel:'粒子数 n',ylabel:'成对检查'})+text(20,25,'朴素所有粒子两两比较',C.ink,17),'n=100 → 4950 对')),
 group('局部关节角怎样沿父子层级变为世界末端位置？',
  P('第一关节 0°，第二 90°','第二关节的角相对父节点定义；世界角为 90°，末端为 (1,1)。',arm(0,Math.PI/2)+text(20,28,'θ₁=0°，θ₂=90°',C.ink,17),'p=(1,1)，l₁=l₂=1'),
  P('第一关节 45°，第二 45°','第二杆世界角为 90°，不是 45°；父变换改变子杆朝向与起点。',arm(Math.PI/4,Math.PI/4)+text(20,28,'θ₁=45°，θ₂=45°',C.ink,17),'p≈(0.707,1.707)'),
  P('角度插值的末端路径','固定 θ₂=90°、θ₁ 从 0 到 90°，FK 末端沿圆弧运动；虚线端点连线不是实际路径。',grid(30,50,300,150,30)+polyline(seq(41,i=>{const t=i*Math.PI/80;return[150+60*(Math.cos(t)-Math.sin(t)),170-60*(Math.sin(t)+Math.cos(t))];}),C.mint,3)+line(210,110,90,110,C.orange,2,'4 4')+text(20,25,'绿：FK 圆弧；橙：直线',C.ink,17),'角度匀速 ≠ 末端沿直线')),
 group('同一目标为何可能两解、无解，或遇到奇异姿态？',
  P('两种弯肘分支','l₁=l₂=1，目标 (1,1)。绿色为 (0°,90°)，橙色为 (90°,−90°)，均达到目标。',arm(0,Math.PI/2,[1,1])+polyline([[150,170],[150,110],[210,110]],C.orange,5)+text(20,25,'同目标，两个关节组合',C.ink,17),'误差都为 0；姿态不同'),
  P('不可达目标','目标 (2.5,0) 超出最大半径 2；灰弧显示可达圆的上半部。图中投影到最远可达点，并明确显示残余误差。',arm(0,0,[2.5,0])+path('M30 170 A120 120 0 0 1 270 170',C.muted,'none',1.5)+line(270,170,300,170,C.red,3,'4 4')+text(20,25,'目标距离 2.5 > 最大 2',C.ink,17),'最近可达点 (2,0)，误差 0.5'),
  P('伸直时的奇异','两杆均水平：Jacobian 两列分别为 (0,2)、(0,1)；一阶关节变化只能向竖直移动。',arm(0,0)+arrow(270,168,270,86,C.blue)+arrow(284,168,284,127,C.orange)+text(20,25,'θ₁=θ₂=0°',C.ink,17)+text(55,218,'横向一阶导数都为 0',C.muted,16),'J 两列共线，不能直接求逆')),
 group('绑定、表情组合和重定向分别需要哪些一致性条件？',
  P('骨骼加权的基本意义','示意一个顶点受两骨骼变换结果影响：p₁=(0,1)、p₂=(1,0)，权重 0.75、0.25。',chart([],{xmin:0,xmax:1,ymin:0,ymax:1,xlabel:'x',ylabel:'y'})+circle(45,55,6,C.blue)+circle(315,205,6,C.orange)+line(45,55,315,205,C.muted,2,'4 4')+circle(112.5,92.5,7,C.mint)+text(85,35,'两变换结果间的权重组合',C.ink,16),'p=(0.25,0.75)，权重和为 1'),
  P('Blend Shapes：用差分','基础顶点 (0,0)，微笑差分 (0,1)、皱眉差分 (1,0)，权重分别 0.5 与 0.25。',chart([],{xmin:0,xmax:1,ymin:0,ymax:1,xlabel:'x',ylabel:'y'})+arrow(45,205,45,130,C.blue)+arrow(45,130,112.5,130,C.orange)+circle(112.5,130,7,C.mint)+text(65,30,'p=p₀+0.5Δp笑+0.25Δp皱',C.ink,16),'p=(0.25,0.5)，拓扑需对应'),
  P('重定向：同角度不同接触','两组腿长不同但角度相同，根位置相同；短腿脚离地，需要接触约束与 IK 调整。',line(25,205,335,205,C.muted,3)+polyline([[95,55],[135,130],[95,205]],C.blue,7)+polyline([[245,55],[277,115],[245,175]],C.orange,7)+circle(95,205,7,C.blue)+circle(245,175,7,C.orange)+arrow(245,180,245,201,C.purple)+text(30,28,'长腿演员',C.blue,17)+text(215,28,'短腿角色',C.orange,17),'复制角度不保证脚掌落地'))
],
22:[
 group('步长减小后的轨迹，是否向同一物理时间的解析解收敛？',
  P('衰减向量场','y′=−y：越大的 y，其向下变化越快；箭头为不同状态的导数方向。',chart([{points:seq(41,i=>[i/40,Math.exp(-i/40)]),color:C.mint}],{xlabel:'t / s',ylabel:'y'})+seq(5,i=>seq(5,j=>arrow(58+i*56,75+j*26,77+i*56,75+j*26+18*(1-j*.18),C.muted,1)).join('')).join('')+text(20,25,'绿：解析 y=e⁻ᵗ',C.ink,17),'每个状态的导数决定方向'),
  P('Euler h=0.5','显式更新 yₙ₊₁=(1−h)yₙ；两步正好到 1 秒。橙色折线比解析衰减更快。',chart([{points:[[0,1],[.5,.5],[1,.25]],color:C.orange},{points:seq(101,i=>[i/100,Math.exp(-i/100)]),color:C.mint}],{xlabel:'t / s',ylabel:'y'})+text(20,25,'相同初值，相同总时长',C.ink,17),'y(1)=0.25；精确约 0.3679'),
  P('Euler h=0.125','八步到同一个 1 秒终点；较小步长降低误差，不能只固定两步来比较。',chart([{points:seq(9,i=>[i*.125,Math.pow(.875,i)]),color:C.blue},{points:seq(101,i=>[i/100,Math.exp(-i/100)]),color:C.mint}],{xlabel:'t / s',ylabel:'y'})+text(20,25,'蓝：8 步；绿：解析',C.ink,17),'y(1)≈0.3436，误差减小')),
 group('显式 Euler 的无外力能量增长，能否从一步算出来？',
  P('相空间切线走到圆外','取 k=1，初值 (x,v)=(1,0)，h=0.5；真实圆轨道与 Euler 下一点 (1,−0.5) 比较。',circle(175,126,76,'none',C.orange,2)+line(65,126,288,126,C.grid)+line(175,38,175,214,C.grid)+circle(251,126,6,C.orange)+arrow(251,126,251,164,C.mint)+circle(251,164,6,C.mint)+text(20,25,'横轴 x；纵轴 v',C.ink,17)+text(20,225,'离散点半径 √1.25',C.muted,16),'E₁/E₀=1+h²=1.25'),
  (()=>{const d=energy('explicit',.1,1);return P('k=4，h=0.1','每步能量乘 1.04，10 步到 1 秒；曲线由实际位置速度更新计算。',d.svg,`E(1)=${fmt(d.e,4)} J`);})(),
  (()=>{const d=energy('explicit',.05,1);return P('同一秒，h=0.05','20 步到同一时刻，能量每步乘 1.01；减小步长只减慢增长。',d.svg,`E(1)=${fmt(d.e,4)} J`);})()),
 group('半隐式的有界振荡与隐式的数值耗散，怎样从同一系统看出来？',
  (()=>{const d=energy('symplectic',.1,3);return P('半隐式：更新次序改变','k=4，先 v←v−hkx，再 x←x+hv；h√k=0.2<2，能量有界波动。',d.svg,`E(3)=${fmt(d.e,3)} J`);})(),
  (()=>{const d=energy('implicit',.1,3);return P('隐式：解未来状态','同一振子，直接联立解新位置和速度；能量每步除以 1.04，模型本身没有阻尼。',d.svg,`E(3)=${fmt(d.e,3)} J`);})(),
  (()=>{const r=oscillator('symplectic',1.1,4),values=r.map(a=>a[1]),bound=Math.max(...values.map(Math.abs));return P('半隐式越过稳定边界','k=4、h=1.1，所以 h√k=2.2>2；图中五个位置由同一更新规则算出，并非任意画出爆炸线。',chart([{points:r.map(a=>[a[0],a[1]]),color:C.red}],{xmax:4.4,ymin:-bound,ymax:bound,xlabel:'t / s',ylabel:'x / m'})+text(20,25,'h√k=2.2，超过边界',C.ink,17),`x(4.4)=${fmt(values.at(-1),2)} m`);})()),
 group('高阶方法和自适应控制能改进什么，又不能保证什么？',
  P('显式中点两次求导','对 y′=−y、y₀=1、h=0.2：先预测中点 0.9，用中点导数 −0.9 推进到 0.82。',chart([{points:[[0,1],[.1,.9]],color:C.blue},{points:[[0,1],[.2,.82]],color:C.mint},{points:seq(41,i=>[i*.005,Math.exp(-i*.005)]),color:C.orange}],{xmax:.2,ymin:.78,ymax:1,xlabel:'t / s',ylabel:'y'})+text(20,25,'蓝：半步预测；绿：完整更新',C.ink,16),'中点 0.82；精确 0.818731'),
  P('二阶仍不严格守恒','无阻尼 k=4、h=0.1，中点每步能量乘 1.0004，100 步之后仍增加。曲线使用真实离散状态。',(()=>{const d=energy('midpoint',.1,10);return d.svg;})(),'E(10)=2×1.0004¹⁰⁰≈2.0816'),
  P('大步与两个半步估计误差','衰减系统的中点法：一大步 0.2 得 0.82；两步 0.1 得 0.819025。差异约 0.000975。',text(20,25,'同一总时长 0.2 s',C.ink,17)+text(25,74,'一大步',C.blue,17)+arrow(105,68,270,68,C.blue)+text(278,74,'0.82',C.blue,16)+text(25,135,'两半步',C.mint,17)+arrow(105,129,177,129,C.mint)+arrow(189,129,270,129,C.mint)+text(170,164,'0.905',C.muted,16)+text(220,207,'0.819025',C.mint,17),'误差估计依赖光滑性和方法阶')),
 group('历史位置怎样编码初速度，约束投影又怎样改变速度？',
  P('Verlet 的正确启动','x₀=1、v₀=0、a₀=−4、h=0.1：x₋₁=0.98。正确首步 x₁=0.98。',chart([{points:[[-.1,.98],[0,1],[.1,.98]],color:C.mint},{points:seq(61,i=>{const t=-.1+i/300;return[t,Math.cos(2*t)];}),color:C.orange}],{xmin:-.1,xmax:.1,ymin:.95,ymax:1.01,xlabel:'t / s',ylabel:'x / m'})+text(20,25,'绿：Verlet；橙：解析',C.ink,17),'历史位置需包含 ½h²a'),
  P('错误启动：忽略加速度项','误设 x₋₁=x₀=1，更新得 x₁=0.96；即使画面在运动也不表示初速度符合预期。',chart([{points:[[-.1,1],[0,1],[.1,.96]],color:C.red},{points:seq(61,i=>{const t=-.1+i/300;return[t,Math.cos(2*t)];}),color:C.orange}],{xmin:-.1,xmax:.1,ymin:.95,ymax:1.01,xlabel:'t / s',ylabel:'x / m'})+text(20,25,'红：错误历史位置',C.ink,17),'首步误差约 −0.0201 m'),
  P('等质量距离约束投影','预测端点相距 1.2 m，静止约束 1 m；两端各向内移 0.1 m，随后要由修正位移更新速度。',line(54,85,294,85,C.muted,3)+circle(54,85,8,C.blue)+circle(294,85,8,C.orange)+text(126,55,'预测 1.2 m',C.muted,17)+arrow(54,110,74,151,C.blue)+arrow(294,110,274,151,C.orange)+line(74,169,274,169,C.mint,3)+circle(74,169,8,C.blue)+circle(274,169,8,C.orange)+text(131,205,'投影 1.0 m',C.mint,17),'位置满足约束不等于能量守恒')),
 group('相同合力、不同作用点，为何产生不同转动趋势？',
  P('力作用在质心','矩形刚体质心在原点，向上 10 N 力作用于中心，力臂为零，力矩为零。',rect(80,91,200,85,C.panel,C.blue)+circle(180,134,6,C.orange)+arrow(180,128,180,54,C.mint,4)+text(202,68,'F=10 N',C.mint,16)+text(20,25,'质心受力',C.ink,17),'r=0 → τ=0'),
  P('力作用在右端','作用点距质心 1 m，力为 (0,10) N，叉积力矩为 +10 N·m，产生逆时针趋势。',rect(70,91,200,85,C.panel,C.blue)+circle(170,134,6,C.orange)+arrow(170,134,270,134,C.orange)+arrow(270,128,270,53,C.mint,4)+text(190,158,'r=1 m',C.orange,16)+text(20,25,'偏心作用点',C.ink,17),'τz=rₓFᵧ=10 N·m'),
  P('力偶：平移合力为零','左端向下 10 N，右端向上 10 N，两端距质心各 1 m；两个力矩同号。',rect(80,91,200,85,C.panel,C.blue)+circle(180,134,6,C.orange)+arrow(80,135,80,210,C.mint,4)+arrow(280,133,280,58,C.mint,4)+text(20,25,'两力大小相等、方向相反',C.ink,17)+text(140,214,'F合=0',C.muted,17),'τ合=20 N·m，仍可转动')),
 group('粒子与网格的表示改变时，质量与动量怎样保持一致？',
  P('跟随粒子 vs 固定网格','绿色点为同一物质样本在 t₀、t₁ 的位置，背景网格固定；这展示两种观察视角。',grid(35,48,285,155,38)+seq(6,i=>{const x=55+i*42,y=103+(i%2)*42;return circle(x,y,5,C.blue)+arrow(x+6,y,x+22,y-18,C.muted,1.5)+circle(x+28,y-23,6,C.mint);}).join('')+text(20,25,'蓝 t₀ → 绿 t₁；网格不移动',C.ink,16),'随物质走 / 在固定位置看'),
  P('MPM：粒子到网格 P2G','简化两节点权重 0.25 与 0.75，质量 2 kg、速度 3 m/s。节点分别得到质量 0.5、1.5，动量 1.5、4.5。',circle(180,78,14,C.orange)+text(180,40,'粒子 m=2，mv=6',C.orange,17,'middle')+arrow(169,95,84,143,C.blue)+arrow(192,95,277,143,C.mint)+rect(40,157,95,44,C.panel,C.blue)+rect(223,157,96,44,C.panel,C.mint)+text(87,184,'w=0.25',C.blue,16,'middle')+text(271,184,'w=0.75',C.mint,16,'middle')+text(24,224,'m=0.5，p=1.5',C.blue,16)+text(205,224,'m=1.5，p=4.5',C.mint,16),'Σw=1 → Σm=2，Σp=6'),
  P('网格速度再传回 G2P','无网格受力时两节点速度 p/m 都等于 3；用相同权重回传得到粒子速度 3。这仅是守恒传输示意。',rect(40,43,95,45,C.panel,C.blue)+rect(223,43,96,45,C.panel,C.mint)+text(87,73,'v₁=3',C.blue,17,'middle')+text(271,73,'v₂=3',C.mint,17,'middle')+arrow(87,102,167,161,C.blue)+arrow(271,102,193,161,C.mint)+circle(180,180,15,C.orange)+text(180,223,'v=0.25×3+0.75×3=3',C.ink,16,'middle'),'完整 MPM 还需应力与边界')),
 group('怎样用平衡状态、收敛与能量日志定位模拟错误？',
  P('静止平衡反例','三质量点的弹簧都在静止长度，速度为零，关闭重力；绿色点不应随积分步自行偏移。',line(55,124,305,124,C.mint,3)+[55,180,305].map((x,i)=>circle(x,124,10,i===0?C.muted:C.mint)+text(x,164,`v${i}=0`,C.ink,16,'middle')).join('')+rect(39,107,31,34,'none',C.orange)+text(20,25,'左端固定；F弹簧=0',C.ink,17)+text(65,207,'检查残留力与固定点',C.muted,17),'平衡状态应始终静止'),
  P('同一时刻的步长收敛','无阻尼 k=4，显式 Euler 在 t=1 s 的位置；橙虚线为解析 cos(2)。横轴是步长 h。',(()=>{const hs=[.0125,.025,.05,.1,.2];return chart([{points:hs.map(h=>[h,oscillator('explicit',h,Math.round(1/h)).at(-1)[1]]),color:C.blue},{points:[[.0125,Math.cos(2)],[.2,Math.cos(2)]],color:C.orange,dash:'4 4'}],{xmin:.0125,xmax:.2,ymin:-.58,ymax:-.32,xlabel:'h / s',ylabel:'x(1)'})+text(20,25,'每组步数 = 1/h',C.ink,17);})(),'减小 h，结果应趋向解析值'),
  P('阻尼符号的故意反例','解 x″+cx′+4x=0 的欠阻尼解析解，从 x₀=1、v₀=0。绿线 c=0.4 能量下降，红线 c=−0.4 能量增加。',(()=>{const sample=c=>seq(101,i=>{const t=i*.04,w=Math.sqrt(4-c*c/4),a=c/(2*w),x=Math.exp(-c*t/2)*(Math.cos(w*t)+a*Math.sin(w*t)),v=-Math.exp(-c*t/2)*4/w*Math.sin(w*t);return[t,.5*v*v+2*x*x];});const a=sample(.4),b=sample(-.4);return chart([{points:a,color:C.mint},{points:b,color:C.red}],{xmax:4,ymin:0,ymax:Math.max(...b.map(p=>p[1])),xlabel:'t / s',ylabel:'E / J'})+text(20,25,'同初值；只有阻尼符号不同',C.ink,16);})(),'日志区分耗散与能量注入'))
]
};
