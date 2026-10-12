import {C,text,line,arrow,rect,circle,polygon,polyline,path,grid,axes,label,bars,spark,panel,group} from './primitives.mjs';

// Original teaching diagrams. Geometry is schematic; numeric conclusions state
// the corresponding idealized model, rather than claiming measured appearance.
const foot=s=>text(180,249,s,C.mint,17,'middle');
const note=(s,color=C.muted)=>text(180,25,s,color,17,'middle');
const P=(title,caption,svg)=>panel(title,caption,svg);
const v=(x,y,s,c=C.ink)=>text(x,y,s,c,16);
const eye=(x=35,y=132)=>path(`M ${x-15} ${y} Q ${x} ${y-15} ${x+15} ${y} Q ${x} ${y+15} ${x-15} ${y}`,C.blue)+circle(x,y,4,C.blue);
const lamp=(x=303,y=48)=>circle(x,y,10,C.orange)+[0,1,2,3,4,5,6,7].map(i=>{const a=i*Math.PI/4;return line(x+14*Math.cos(a),y+14*Math.sin(a),x+20*Math.cos(a),y+20*Math.sin(a),C.orange,2);}).join('');
const point=(x,y,s,c=C.mint)=>circle(x,y,4,c)+v(x+7,y-8,s,c);
const surface=(y=192)=>line(28,y,332,y,C.blue,4);
const interval=(y,a,b,s,c=C.blue)=>line(55,y,315,y,C.grid,2)+line(55+a*37,y,55+b*37,y,c,8)+v(18,y+5,s,c)+v(55+a*37-4,y-13,String(a),c)+v(55+b*37-4,y-13,String(b),c);
function chart(fn,{min=0,max=1,color=C.mint,x=48,y=204,w=272,h=142,count=80}={}){return line(x,y,x+w,y,C.muted,1.4)+line(x,y,x,y-h,C.muted,1.4)+spark(Array.from({length:count},(_,i)=>fn(i/(count-1))),{x,y,w,h,min,max,color});}
function beam(angle=0,r=2){const cy=151,cx=182,half=69,rad=angle*Math.PI/180;const dx=Math.cos(rad)*half,dy=Math.sin(rad)*half;return note(`接收面倾斜 ${angle}°`)+line(cx-dx,cy-dy,cx+dx,cy+dy,C.blue,5)+[-.85,-.42,0,.42,.85].map(a=>{const x=cx+a*dx;return arrow(x,53,x,cy+a*dy,C.orange);}).join('')+arrow(cx,cy,cx+46*Math.sin(rad),cy-46*Math.cos(rad),C.mint)+v(cx+12,cy-31,'n',C.mint)+foot(`I=8，r=${r}：E=${(8/(r*r)*Math.cos(rad)).toFixed(2)} W/m²`);}
function hemiFan({n=9,focus=false,color=C.orange,origin=[180,191],length=119}={}){const [x,y]=origin;return surface(y)+arrow(x,y,x,y-143,C.muted,1.6)+Array.from({length:n},(_,i)=>{const a=focus?(-.18+.36*i/(n-1)):(-1.35+2.7*i/(n-1));return arrow(x+Math.sin(a)*length,y-Math.cos(a)*length,x+Math.sin(a)*22,y-Math.cos(a)*22,color,2);}).join('');}
function outFan(kind='diffuse'){let out=surface(193)+arrow(55,51,180,193,C.orange)+arrow(180,193,180,44,C.muted,1.5)+v(36,44,'来光',C.orange);if(kind==='mirror')out+=arrow(180,193,304,51,C.mint,4);else for(let i=0;i<11;i++){const a=kind==='glossy'?(.48+i*.043):(-1.4+i*.28),len=kind==='glossy'?106*Math.exp(-Math.pow((a-.70)/.20,2))+20:111;out+=arrow(180,193,180+Math.sin(a)*len,193-Math.cos(a)*len,C.mint,2);}return out;}
function tree(values=[3,3],same=false){return rect(125,39,110,40,C.panel,C.blue,7)+v(140,64,'包围全部')+line(153,79,83,119,C.grid)+line(207,79,277,119,C.grid)+rect(34,119,98,42,C.panel,C.mint,6)+rect(228,119,98,42,C.panel,C.purple,6)+text(83,145,`${values[0]} 个对象`,C.mint,16,'middle')+text(277,145,`${values[1]} 个对象`,C.purple,16,'middle')+(same?arrow(277,166,277,212,C.red)+v(208,216,'规模不减 → 循环',C.red):arrow(83,166,83,209,C.mint)+arrow(277,166,277,209,C.purple)+v(52,222,'叶子')+v(246,222,'叶子'));}
function cloud(xs,{target=180,y=131,color=C.blue}={}){return line(target,57,target,205,C.mint,2,'5 4')+xs.map((x,i)=>circle(x,y+(i%3-1)*15,4,color)).join('');}
const dome=(cx=180,cy=183,r=119)=>path(`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`,C.grid);
const lobes=(rough=.2,color=C.mint)=>chart(t=>Math.exp(-Math.pow((t-.55)/(rough*.42+.035),2)),{color});
function fiberPaths(){
 const center=[184,133],radius=68,unit=a=>{const h=Math.hypot(...a);return a.map(v=>v/h);},dp=(a,b)=>a[0]*b[0]+a[1]*b[1],normal=p=>unit(p.map((v,i)=>v-center[i]));
 const reflect=(d,n)=>d.map((v,i)=>v-2*dp(d,n)*n[i]);
 const refract=(d,n,eta)=>{const c=-dp(d,n),k=1-eta*eta*(1-c*c);if(k<0)throw Error('fiber path unexpectedly TIR');return d.map((v,i)=>eta*v+(eta*c-Math.sqrt(k))*n[i]);};
 const next=(p,d)=>{const t=-2*dp(p.map((v,i)=>v-center[i]),d);return p.map((v,i)=>v+t*d[i]);};
 const external=(p,d,len=46)=>p.map((v,i)=>v+len*d[i]);
 let svg='';
 for(const [kind,b,color] of [['R',-.70,C.mint],['TT',-.15,C.orange],['TRT',.55,C.purple]]){
  const p=[center[0]-radius*Math.sqrt(1-b*b),center[1]+b*radius],d=[1,0],n=normal(p);svg+=arrow(34,p[1],p[0],p[1],color,2.4);
  if(kind==='R'){const out=external(p,reflect(d,n));svg+=arrow(...p,...out,color,2.4);}
  else{const inside=refract(d,n,1/1.55),q=next(p,inside);svg+=line(...p,...q,color,2.4);if(kind==='TT'){const out=external(q,refract(inside,normal(q).map(v=>-v),1.55));svg+=arrow(...q,...out,color,2.4);}else{const bounce=reflect(inside,normal(q)),z=next(q,bounce),out=external(z,refract(bounce,normal(z).map(v=>-v),1.55));svg+=polyline([q,z,out],color,2.4);}}
  svg+=v(36,p[1]-9,kind,color);
 }return svg;
}
const samplePoints=(n,{x=55,y=54,w=250,h=143,color=C.mint,seed=0}={})=>Array.from({length:n},(_,i)=>{const a=((i*73+seed*29)%997)/997,b=((i*193+seed*71)%991)/991;return circle(x+a*w,y+b*h,3,color);}).join('');

export const transportVisuals={
17:[
 group('相同基础色，为什么漫反射、光泽和镜面仍显著不同？',
  P('漫反射：出射辐亮度相同','绿色箭头示意可向整个半球出射；箭头不表示各方向总功率相等。',outFan('diffuse')+foot('Lambert：Lₒ 不依赖观察方向')),
  P('光泽：有限宽波瓣','反射集中在镜面方向附近，峰值与宽度同时影响外观。',outFan('glossy')+foot('有限波瓣：宽度受粗糙度影响')),
  P('镜面：唯一方向约束','理想平面镜将入射能量集中到满足反射几何关系的方向。',outFan('mirror')+foot('理想镜面含 delta 分布'))),
 group('反射、折射和全反射的方向分别由什么约束？',
  P('反射方向关于法线对称','图中蓝箭头为指向表面的传播方向，绿色箭头为离开的反射方向。',surface(185)+arrow(59,64,180,185,C.blue)+arrow(180,185,301,64,C.mint)+arrow(180,185,180,40,C.muted,1.5)+path('M 146 151 A 48 48 0 0 1 180 137',C.blue)+path('M 180 137 A 48 48 0 0 1 214 151',C.mint)+v(113,125,'θ',C.blue)+v(211,125,'θ',C.mint)+foot('dᵣ = d − 2(d·n)n')),
  P('进入玻璃：折向法线','空气到玻璃，入射角 40° 对应折射角约 25.4°，两角都相对法线。',rect(30,124,301,92,'#183247')+line(30,124,331,124,C.blue,3)+line(177,38,177,211,C.muted,1.5,'5 4')+arrow(111,46,177,124,C.orange)+arrow(177,124,218,210,C.mint)+v(212,61,'空气 n=1')+v(30,165,'玻璃 n=1.5')+v(69,98,'40°',C.orange)+v(224,198,'25.4°',C.mint)+foot('n₁ sinθᵢ = n₂ sinθₜ')),
  P('玻璃到空气：全反射','入射角 50° 超过约 41.8° 的临界角，没有传播的折射解。',rect(30,125,301,93,'#183247')+line(30,125,331,125,C.blue,3)+line(178,37,178,218,C.muted,1.5,'5 4')+arrow(82,204,178,125,C.orange)+arrow(178,125,274,204,C.mint)+v(206,76,'空气')+v(30,159,'玻璃')+v(92,179,'50°',C.orange)+v(238,174,'反射',C.mint)+foot('sinθₜ=1.5 sin50°>1：无实解'))),
 group('玻璃表面的反射比例为什么不能固定为 4%？',
  P('Schlick 近似的角度变化','正入射为 F₀，越接近掠射反射越强；此处只展示介质常用近似。',chart(t=>.04+.96*Math.pow(1-Math.cos(t*Math.PI/2),5),{max:1,color:C.mint})+v(43,49,'F₀=.04')+v(34,225,'0°')+v(289,225,'90°')+v(64,180,'正入射低')+v(208,79,'掠射增强',C.mint)+foot('F ≈ F₀+(1−F₀)(1−cosθ)⁵')),
  P('同一材料，不同入射角','玻璃 n=1.5：Schlick 在 0°、60°、85° 给出约 .04、.07、.649。',bars([.04,.07,.649],56,193,257,132,[C.blue,C.purple,C.mint])+v(55,222,'0°')+v(141,222,'60°')+v(228,222,'85°')+v(52,172,'.04')+v(137,163,'.07')+v(230,53,'.649')+foot('4% 仅是正入射的近似起点')),
  P('折射率决定正入射 F₀','空气进入 n=1.3、1.5、2 的理想无吸收介质，反射率不同。',bars([Math.pow(.3/2.3,2),.04,1/9],59,193,250,132,[C.blue,C.purple,C.orange])+v(55,222,'n=1.3')+v(139,222,'1.5')+v(236,222,'2')+v(47,49,'F₀=((1−n)/(1+n))²')+foot('约 1.7%、4.0%、11.1%'))),
 group('微面法线分布、Fresnel 与遮蔽分别改变什么？',
  P('半程向量选出有效微面','wi 和 wo 都从表面指向外部，只有法线为半程方向的微面匹配这对方向。',surface(194)+arrow(177,194,61,84,C.blue)+arrow(177,194,288,68,C.orange)+arrow(177,194,170,48,C.mint)+line(139,196,215,191,C.purple,6)+v(30,76,'ωᵢ',C.blue)+v(290,59,'ωₒ',C.orange)+v(179,53,'h',C.mint)+foot('h = normalize(ωᵢ + ωₒ)')),
  P('粗糙度改变法线统计宽度','图为一维归一化高斯密度的示意切片；粗糙表面分布更宽，峰值降低。',chart(t=>Math.exp(-Math.pow((t-.5)/.055,2))/(.055*Math.sqrt(Math.PI)),{max:11,color:C.blue})+spark(Array.from({length:81},(_,i)=>Math.exp(-Math.pow((i/80-.5)/.22,2))/(.22*Math.sqrt(Math.PI))),{x:48,y:204,w:272,h:142,max:11,color:C.mint})+v(43,48,'窄分布',C.blue)+v(227,145,'宽分布',C.mint)+foot('D：法线分布；F：界面反射比例')),
  P('微面之间会遮挡光与视线','橙色入射光被高微面挡住，凹部微面不能无条件贡献镜面反射。',polyline([[29,177],[89,119],[120,185],[194,98],[235,183],[302,120],[332,166]],C.purple,4)+arrow(31,54,163,134,C.orange)+line(163,134,226,172,C.red,2,'5 4')+circle(163,134,5,C.red)+arrow(232,177,302,47,C.mint)+v(28,218,'遮挡与掩蔽由 G 描述')+foot('D × F × G；不能仅改变高光亮度'))),
 group('各向同性与互易性分别是怎样的对称性？',
  P('绕法线共同旋转方向对','俯视两对方向，夹角相同；各向同性材质的响应与共同旋转无关。',circle(91,134,61,C.panel,C.grid)+circle(268,134,61,C.panel,C.grid)+arrow(91,134,47,92,C.blue)+arrow(91,134,143,99,C.orange)+arrow(268,134,309,90,C.blue)+arrow(268,134,301,186,C.orange)+circle(91,134,4,C.mint)+circle(268,134,4,C.mint)+v(72,222,'原方向对')+v(223,222,'旋转 90°')+foot('保持相对几何，fᵣ 不变')),
  P('各向异性依赖切线方向','示意相同椭圆响应随纤维切线旋转；拉长轴代表方向相关响应。',path('M 28 130 C 28 70 152 70 152 130 C 152 190 28 190 28 130',C.mint)+path('M 263 67 C 325 67 325 199 263 199 C 201 199 201 67 263 67',C.purple)+arrow(31,132,148,132,C.muted,1.5)+arrow(263,197,263,72,C.muted,1.5)+v(34,221,'切线水平')+v(213,221,'切线竖直')+foot('需保存表面切线与不同轴粗糙度')),
  P('互易性与能量守恒分别检查','交换 wi 与 wo 检查函数；半球积分检查总反射能量，二者不能混为一谈。',rect(27,50,305,70,C.panel,C.blue,6)+rect(27,150,305,70,C.panel,C.mint,6)+v(49,79,'互易：fᵣ(wi,wo)=fᵣ(wo,wi)',C.blue)+v(49,106,'交换方向，不是换光照图像')+v(49,181,'守恒：∫ fᵣ cosθ dω ≤ 1',C.mint)+v(49,208,'约束整个出射半球')+foot('非负、互易、守恒是不同性质'))),
 group('实测表格保留细节，解析参数模型又牺牲和获得了什么？',
  P('受控角度扫描材质','照明方向和观察方向都需要变化；球面形状和仪器要校准。',circle(180,151,44,C.panel,C.mint)+lamp(57,63)+eye(303,69)+arrow(68,74,157,113,C.orange)+arrow(208,118,291,78,C.blue)+dome(180,151,106)+v(28,210,'控光源方向')+v(218,210,'控观察方向')+foot('记录响应与几何，处理噪声和校准')),
  P('测量结果形成方向表格','示意二维切片中响应集中在部分方向；真实 BRDF 数据维度更高。',Array.from({length:8},(_,j)=>Array.from({length:9},(_,i)=>{const z=Math.exp(-Math.pow((i-j*.8-1)/1.5,2));return rect(51+i*29,48+j*19,27,17,`rgb(${Math.round(25+z*107)},${Math.round(46+z*165)},${Math.round(65+z*124)})`);}).join('')).join('')+v(77,225,'入射角 × 出射角切片')+foot('表格保细节，插值与采样仍需设计')),
  P('参数拟合可能丢失细节','蓝线为有双肩的示例数据，绿线为单波瓣近似；残差并不自动消失。',chart(t=>.8*Math.exp(-Math.pow((t-.46)/.08,2))+.38*Math.exp(-Math.pow((t-.67)/.13,2)),{color:C.blue})+spark(Array.from({length:81},(_,i)=>.7*Math.exp(-Math.pow((i/80-.51)/.16,2))),{x:48,y:204,w:272,h:142,color:C.mint})+v(43,46,'实测细节',C.blue)+v(224,79,'紧凑拟合',C.mint)+foot('解析模型易编辑；拟合误差需量化')))
],
18:[
 group('看起来平滑的结果，怎样区分有偏、无偏与一致性？',
  P('两组估计的中心不同','蓝色云围绕真值，紫色云稳定偏移；单张低噪声不能证明无偏。',cloud([116,133,169,188,152,164,158,142],{target:155,y:106,color:C.blue})+cloud([226,230,233,229,238,236,224,232],{target:155,y:172,color:C.purple})+v(198,78,'无偏示例',C.blue)+v(192,209,'稳定偏移',C.purple)+foot('偏差 = E[Î]−I')),
  P('固定偏差不能靠样本数消除','紫色曲线在增加样本后仍有误差下限；绿色示意一致估计的趋近。',chart(t=>.25+.65/Math.sqrt(1+99*t),{color:C.purple})+spark(Array.from({length:81},(_,i)=>.9/Math.sqrt(1+99*i/80)),{x:48,y:204,w:272,h:142,color:C.mint})+v(39,49,'误差幅度示意')+v(189,116,'固定模型偏差',C.purple)+v(190,182,'趋近真值',C.mint)+foot('一致性还需要相关参数正确变化')),
  P('同时比较偏差、方差与成本','示例 A 无偏但方差 .09；B 偏差 .2、方差 .01，总误差仍要合并判断。',bars([.09,.01,.04,.05],58,191,255,132,[C.blue,C.purple,C.orange,C.mint])+v(42,217,'A方差')+v(105,217,'B方差')+v(169,217,'偏差²')+v(245,217,'B总计')+foot('MSE(A)=.09，MSE(B)=.05'))),
 group('双向连接与路径空间突变，各自改变的是哪一部分采样？',
  P('从相机和灯两端建子路径','虚线连接两端顶点，仍需遮挡测试、端点散射、几何项和 PDF。',eye(33,128)+lamp(313,50)+polyline([[43,131],[101,199],[162,127]],C.blue,3)+polyline([[305,67],[282,199],[220,105]],C.orange,3)+line(162,127,220,105,C.mint,3,'5 4')+[[101,199],[162,127]].map(p=>circle(...p,5,C.blue)).join('')+[[282,199],[220,105]].map(p=>circle(...p,5,C.orange)).join('')+v(34,52,'相机子路径',C.blue)+v(229,228,'光源子路径',C.orange)+foot('BDPT：多连接策略用正确权重合成')),
  P('Metropolis 在已有路径附近探索','几条微小扰动路径共用狭窄孔洞；还需大型跳跃避免困在单一区域。',rect(168,35,16,80,C.panel,C.red)+rect(168,135,16,87,C.panel,C.red)+lamp(297,71)+eye(36,175)+[[-7,C.blue],[0,C.mint],[7,C.purple]].map(([off,col])=>polyline([[45,175],[119,178+off],[177,125+off/2],[287,80+off]],col,2)).join('')+arrow(235,184,302,164,C.orange)+v(201,216,'大型跳跃',C.orange)+v(49,51,'局部突变')+foot('MLT 样本相关；需检查链的混合')),
  P('同一完整路径有多个生成方式','同一连线可对应不同相机/光源子路径长度，不能每种方法都全额累计。',polyline([[34,150],[102,86],[182,177],[261,78],[326,145]],C.grid,4)+[ [34,150],[102,86],[182,177],[261,78],[326,145] ].map((p,i)=>circle(...p,7,i<2?C.blue:C.orange)).join('')+line(108,92,175,169,C.mint,4,'4 4')+line(188,169,254,84,C.purple,4,'4 4')+v(37,49,'连接位置 A',C.mint)+v(189,218,'连接位置 B',C.purple)+foot('方法概览：完整实现需路径概率'))),
 group('收集半径改变了功率密度的哪些误差？不同表面的光子能混收吗？',
  P('同样功率分到更大邻域','两圆内暂设总功率都为 .2 W；半径翻倍，面积增四倍，估计密度减四倍。',circle(87,131,32,C.panel,C.mint)+circle(262,131,64,C.panel,C.purple)+samplePoints(13,{x:65,y:110,w:43,h:40,color:C.mint})+samplePoints(13,{x:240,y:110,w:43,h:40,color:C.purple})+v(59,207,'r=.1 m')+v(223,219,'r=.2 m')+foot('E≈6.37 与 1.59 W/m²')),
  P('更多光子配合更小半径','示意一致性策略：发射数增加，单光子功率降低，半径缩小且邻域仍有样本。',rect(30,51,137,154,C.panel,C.blue,5)+rect(193,51,137,154,C.panel,C.purple,5)+samplePoints(18,{x:41,y:62,w:115,h:132,color:C.blue})+samplePoints(80,{x:204,y:62,w:115,h:132,color:C.purple})+circle(98,130,50,'none',C.mint)+circle(262,130,29,'none',C.mint)+v(38,228,'较少 N，大 r')+v(201,228,'较大 N，小 r')+foot('发射数翻倍时单光子权重需减半')),
  P('几何距离近不等于同一表面','圆邻域同时覆盖薄纸正反面；背面光子不能无条件贡献正面照明。',line(35,114,327,114,C.blue,4)+line(35,137,327,137,C.purple,4)+circle(176,114,66,'none',C.mint)+[136,181,214].map(x=>circle(x,110,5,C.blue)).join('')+[151,192,224].map(x=>circle(x,141,5,C.red)).join('')+v(35,74,'正面光子',C.blue)+v(209,194,'背面需排除',C.red)+foot('检查法线、表面关系与核函数'))),
 group('虚拟点光源为什么不是新创造的光能？近距离尖峰如何产生？',
  P('把间接交互变成可复用样本','灯照到墙面的顶点形成有权重的 VPL，再照向其他接收点。',rect(277,56,17,151,C.red)+surface(207)+lamp(42,50)+arrow(51,63,277,111,C.orange)+circle(277,111,7,C.mint)+[98,159,218].map(x=>arrow(277,111,x,207,C.mint)).join('')+v(170,81,'VPL',C.mint)+v(34,226,'复用间接照明样本')+foot('VPL 权重来自原灯路径和 PDF')),
  P('增加数量时同步归一化权重','二个样本各带 .5 与十个样本各带 .1，都代表同一单位总功率。',[85,136].map(x=>circle(x,86,12,C.blue)).join('')+Array.from({length:10},(_,i)=>circle(52+i%5*60,155+Math.floor(i/5)*32,6,C.mint)).join('')+v(165,91,'2 × .5 = 1',C.blue)+v(65,227,'10 × .1 = 1',C.mint)+foot('不能让 VPL 数量直接放大间接光')),
  P('点几何项在近距离急剧增长','强度 .01 时，距离 .1 m 为 1，.01 m 为 100；裁剪会引入误差。',chart(t=>.01/Math.pow(.01+.09*t,2),{max:100,color:C.orange})+line(48,161.4,320,161.4,C.red,2,'5 4')+v(41,46,'E≈I/r²')+v(48,225,'.01 m')+v(274,225,'.1 m')+v(186,150,'示意裁剪上限',C.red)+foot('稳定尖峰需明确近似与偏差'))),
 group('雾使背景变暗又能被侧光照亮，为什么并不矛盾？',
  P('消光造成指数透射','σt=.5 m⁻¹；距离 0、2、4 m 的未碰撞透射约为 1、.368、.135。',chart(t=>Math.exp(-.5*4*t),{max:1,color:C.mint})+v(40,49,'T(d)=exp(−σt d)')+v(45,225,'0 m')+v(282,225,'4 m')+circle(184,151.76,5,C.orange)+v(202,148,'d=2',C.orange)+foot('σt = σa + σs，单位 m⁻¹')),
  P('分段透射率必须相乘','每段长度 .5 m，透射约 .7788；四段相乘等于传播 2 m 的结果。',[0,1,2,3].map(i=>rect(40+i*71,77,60,102,C.panel,[C.blue,C.purple,C.orange,C.mint][i])+text(70+i*71,120,'.7788',C.ink,16,'middle')+text(70+i*71,157,'.5 m',C.muted,16,'middle')).join('')+[0,1,2].map(i=>v(103+i*71,134,'×')).join('')+foot('(.7788)⁴≈.3679；不能线性相减')),
  P('侧光散射进入视线','背景光被消光，同时侧向灯在雾中散射入相机方向，产生新增亮度。',rect(102,63,162,143,'#1b3044',C.blue,5)+eye(31,134)+lamp(180,37)+rect(309,90,18,84,C.orange)+arrow(309,131,43,131,C.blue,2)+arrow(180,53,180,131,C.orange,3)+arrow(180,131,44,131,C.mint,3)+circle(180,131,8,C.mint)+v(106,226,'介质中的入散射',C.mint)+foot('纯吸收模型不能产生侧光雾亮'))),
 group('纤维内部光路、髓质与大量颗粒，为什么需要不同表示？',
  P('纤维的 R、TT 与 TRT 路径','理想圆柱 n=1.55；各路径按 Snell 定律与反射定律构造，经历不同界面次数及吸收长度。',circle(184,133,68,C.panel,C.blue)+fiberPaths()+foot('内部路径更长 → 选择性吸收更多')),
  P('毛皮髓质可增加内部散射','两根示意圆柱外径相同，右侧新增会散射的中心层；不能只按粗细缩放。',circle(93,127,65,C.panel,C.orange)+circle(266,127,65,C.panel,C.orange)+circle(266,127,31,'#2c4560',C.blue)+samplePoints(18,{x:247,y:108,w:37,h:37,color:C.mint})+arrow(203,77,265,120,C.orange)+arrow(265,120,303,164,C.mint)+arrow(265,120,225,155,C.mint)+v(50,214,'皮质吸收')+v(224,214,'含髓质散射')+foot('相同外径不意味着相同散射结构')),
  P('单颗粒与聚合模型匹配尺度','近景可分辨形状、遮挡；远景同一像素覆盖许多颗粒，只能保留统计响应。',rect(30,49,130,155,C.panel,C.blue,5)+rect(199,49,130,155,C.panel,C.purple,5)+[ [69,98],[115,105],[77,157],[131,166] ].map(([x,y],i)=>polygon([[x-18,y+10],[x-10,y-16],[x+16,y-5],[x+13,y+14]],i%2?C.orange:C.mint,C.bg)).join('')+samplePoints(100,{x:212,y:61,w:103,h:131,color:C.orange})+v(41,228,'单粒几何')+v(207,228,'聚合统计')+foot('表示随像素足迹变化，保留平均能量'))),
 group('光从一个位置进入、另一个位置离开，局部 BRDF 缺少什么？',
  P('局部反射在同一点发生','局部模型只把 p 的入射照明映射到 p 的出射方向，不能自己照亮邻点。',surface(125)+arrow(74,49,134,125,C.orange)+arrow(134,125,192,49,C.mint)+circle(134,125,5,C.mint)+circle(278,125,5,C.purple)+v(135,162,'p')+v(278,162,'q')+v(211,209,'q 不因此获得光')+foot('BRDF：入射与出射位置相同')),
  P('BSSRDF 建立位置之间的传输','入射位置 xi 经内部吸收与多次散射，连接到不同的出射位置 xo。',rect(30,113,302,101,'#203649')+surface(113)+arrow(62,46,106,113,C.orange)+polyline([[106,113],[126,173],[169,147],[191,190],[247,167],[274,113]],C.mint,3)+arrow(274,113,307,45,C.mint)+v(72,98,'xi',C.orange)+v(268,98,'xo',C.mint)+v(135,219,'内部传播')+foot('需要位置、方向与空间核归一化')),
  P('厚度改变透射和边界条件','厚块有更多内部传播空间；薄层的背面与少次散射不能无条件套厚介质近似。',rect(31,73,126,138,'#273747',C.blue)+rect(201,95,126,26,'#273747',C.purple)+arrow(62,38,73,82,C.orange)+polyline([[73,82],[91,147],[115,177],[136,125]],C.mint)+arrow(235,39,246,103,C.orange)+arrow(246,103,276,182,C.mint)+v(64,229,'厚块')+v(239,217,'薄层')+foot('扩散近似有尺度与边界适用条件'))),
 group('纤维、有限微面与波长尺度，分别怎样超出平滑局部模型？',
  P('布料需要保留编织结构','近景可以解析纱线交错；远处才适合过滤后的平均材质响应。',Array.from({length:5},(_,i)=>rect(43+i*57,46,25,159,'#345468',C.blue)).join('')+Array.from({length:4},(_,j)=>Array.from({length:5},(_,i)=>rect(37+i*57,59+j*37,53,18,(i+j)%2?C.purple:C.orange,C.bg,5)).join('')).join('')+v(47,230,'交错纱线与空隙')+foot('近景显式结构，远景聚合响应')),
  P('有限微面造成真实离散闪光','左足迹只包含少量微面，有个别方向匹配；右足迹含许多微面趋于平滑统计。',rect(29,59,130,142,C.panel,C.blue,4)+rect(200,59,130,142,C.panel,C.purple,4)+Array.from({length:9},(_,i)=>polygon([[44+i%3*36,86+Math.floor(i/3)*35],[63+i%3*36,78+Math.floor(i/3)*35],[72+i%3*36,91+Math.floor(i/3)*35],[53+i%3*36,98+Math.floor(i/3)*35]],i===4?C.orange:C.grid,'none')).join('')+samplePoints(150,{x:211,y:70,w:109,h:119,color:'#746966'})+v(45,225,'少量薄片')+v(213,225,'大量薄片')+foot('更多样本不能恢复模型已删掉的结构')),
  P('相干光路的相位决定干涉','示意两条等幅相干光路；光程差 λ 相长，λ/2 相消，几何光学不追踪相位。',spark(Array.from({length:81},(_,i)=>Math.sin(i/80*Math.PI*6)),{x:44,y:95,w:272,h:25,min:-1,max:1,color:C.blue})+spark(Array.from({length:81},(_,i)=>Math.sin(i/80*Math.PI*6)),{x:44,y:127,w:272,h:25,min:-1,max:1,color:C.mint})+spark(Array.from({length:81},(_,i)=>-Math.sin(i/80*Math.PI*6)),{x:44,y:190,w:272,h:25,min:-1,max:1,color:C.purple})+v(38,50,'同相：Δℓ=λ',C.mint)+v(39,158,'反相：Δℓ=λ/2',C.purple)+foot('需考虑波长、带宽与相干性'))),
 group('程序规则怎样跨尺度稳定？坐标选择会让纹理跟随谁？',
  P('多频细节构成程序化外观','三条规则的空间频率不同，叠加形成多尺度变化；频率要有明确单位。',spark(Array.from({length:121},(_,i)=>Math.sin(i/120*Math.PI*4)),{x:70,y:91,w:258,h:28,min:-1,max:1,color:C.blue})+spark(Array.from({length:121},(_,i)=>Math.sin(i/120*Math.PI*20)),{x:70,y:145,w:258,h:28,min:-1,max:1,color:C.purple})+spark(Array.from({length:161},(_,i)=>Math.sin(i/160*Math.PI*60)),{x:70,y:199,w:258,h:28,min:-1,max:1,color:C.orange})+v(24,83,'低',C.blue)+v(24,137,'中',C.purple)+v(24,191,'高',C.orange)+foot('h(x)=Σ aₖ n(fₖ x)；种子固定')),
  P('远处需要足迹过滤','橙色高频曲线在绿色像素足迹内多次振荡，中心采样无法代表区域平均。',rect(126,54,100,152,'#193b35',C.mint)+spark(Array.from({length:181},(_,i)=>Math.sin(i/180*Math.PI*26)),{x:33,y:181,w:292,h:86,min:-1,max:1,color:C.orange})+line(126,138,226,138,C.mint,4)+v(114,42,'一个像素足迹',C.mint)+v(236,224,'均值≈0',C.mint)+foot('高频法线的方差可并入有效粗糙度')),
  P('物体与世界坐标的区别','物体右移时，左图规则随物体移动；右图规则固定在世界中，显现不同局部纹理。',rect(31,69,130,125,C.panel,C.blue)+rect(200,69,130,125,C.panel,C.purple)+[0,1,2,3].map(i=>line(38+i*34,75,38+i*34,188,C.mint,5)).join('')+[0,1,2,3].map(i=>line(214+i*31,75,214+i*31,188,C.orange,5)).join('')+arrow(45,210,145,210,C.blue)+arrow(211,210,311,210,C.purple)+v(35,53,'物体坐标',C.mint)+v(204,53,'世界坐标',C.orange)+foot('学习边界：说明表示、采样和误差')))
],
13:[
 group('哪一个交点决定像素颜色？光源后面的物体会挡光吗？',
  P('最近表面决定可见性','同一条主光线穿过两物体，先遇到的交点才写入像素。',eye()+rect(80,99,9,68,C.purple)+circle(161,132,27,C.mint)+circle(267,132,35,C.panel,C.orange)+arrow(36,132,133,132,C.blue)+line(188,132,307,132,C.blue,2,'5 4')+v(73,91,'像素')+v(115,188,'t=2：可见',C.mint)+v(228,191,'t=5：被挡',C.orange)+foot('主光线返回最小合法 t')),
  P('像素内也要取样','两个像素样本可击中不同表面，边缘颜色取决于采样与覆盖。',eye(30,146)+rect(84,89,26,110,C.panel,C.purple)+circle(210,141,39,C.panel,C.mint)+arrow(31,146,183,112,C.blue)+arrow(31,146,282,177,C.orange)+point(96,131,'a',C.blue)+point(96,159,'b',C.orange)+v(185,80,'几何边缘',C.mint)+foot('a 命中；b 走向背景')),
  P('阴影查询只看有限线段','遮挡物位于光源之后时，不在表面到光源的合法查询区间。',surface(192)+point(75,192,'p')+lamp(235,76)+arrow(75,192,235,76,C.orange)+line(235,76,326,10,C.orange,2,'6 5')+circle(290,36,18,C.panel,C.red)+v(180,142,'光源距离 d')+v(243,188,'灯后物体',C.red)+foot('阴影范围：0 < t < d'))),
 group('镜面、透射和漫反射反弹，哪些由 Whitted 继续追踪？',
  P('理想反射分支','从相机追到镜面后，沿唯一反射方向继续寻找环境。',eye(37,64)+surface(186)+arrow(38,64,180,186,C.blue)+arrow(180,186,322,64,C.mint)+arrow(180,186,180,77,C.muted,1.5)+circle(322,64,18,C.orange)+v(175,68,'n')+v(24,116,'相机')+v(251,128,'反射',C.mint)+foot('入射角 = 反射角')),
  P('玻璃产生两条理想分支','反射留在原介质，折射穿入另一介质，权重由界面响应决定。',rect(29,123,304,87,'#173046')+line(29,123,333,123,C.blue,3)+arrow(55,43,172,123,C.blue)+arrow(172,123,290,43,C.mint)+arrow(172,123,228,207,C.purple)+line(172,38,172,212,C.muted,1.5,'5 4')+v(228,87,'反射 F',C.mint)+v(234,177,'透射',C.purple)+v(34,158,'n₂ > n₁')+foot('无吸收界面：反射 + 透射 = 1')),
  P('间接漫反射需要更一般路径','蓝线在漫反射表面结束；绿线展示路径追踪会随机继续的方向。',surface(196)+rect(276,40,20,157,C.red)+lamp(54,42)+eye(37,135)+arrow(38,135,154,196,C.blue)+arrow(154,196,276,100,C.mint)+arrow(276,100,64,49,C.orange)+v(183,160,'随机反弹',C.mint)+v(253,217,'红墙',C.red)+foot('Whitted 通常不延续漫反射反弹'))),
 group('相同几何射线，把方向长度翻倍后根如何变化？',
  P('单位方向的球求交','球心在 x=0、半径 1；原点 x=−3，最近交点距离为 2。',circle(208,132,55,C.panel,C.mint)+arrow(44,132,322,132,C.blue)+point(43,132,'o=−3',C.blue)+circle(153,132,5,C.orange)+circle(263,132,5,C.orange)+v(126,95,'t=2',C.orange)+v(243,95,'t=4',C.orange)+v(157,213,'|d|=1')+foot('距离 = t · |d| = 2')),
  P('方向翻倍，参数减半','图形和交点不变，只有射线参数的刻度改变。',circle(208,132,55,C.panel,C.mint)+arrow(44,132,322,132,C.blue)+arrow(44,163,134,163,C.purple,4)+circle(153,132,5,C.orange)+circle(263,132,5,C.orange)+v(126,95,'t=1',C.orange)+v(243,95,'t=2',C.orange)+v(49,197,'|d|=2',C.purple)+foot('最近距离仍是 1 × 2 = 2')),
  P('原点在球内时筛选根','负根位于射线后方，前方出口才是合法命中。',circle(180,132,68,C.panel,C.mint)+line(83,132,180,132,C.blue,2,'5 4')+arrow(180,132,326,132,C.blue)+point(180,132,'o',C.blue)+circle(112,132,5,C.red)+circle(248,132,5,C.orange)+v(67,98,'t=−1',C.red)+v(228,98,'t=1',C.orange)+foot('取区间内的最小正根'))),
 group('与三角形所在平面相交，为什么仍可能错过三角形？',
  P('平行情况不能相除','光线方向与平面法线垂直，分母为零；图中原点不在平面上。',surface(180)+arrow(42,91,320,91,C.orange)+arrow(181,180,181,65,C.mint)+v(190,70,'n',C.mint)+v(97,119,'d 与 n 垂直',C.orange)+v(99,210,'平面 y=0')+foot('d·n=0：平行且无交')),
  P('合法重心坐标','A=(0,0)、B=(1,0)、C=(0,1)，点由三个非负权重组合。',polygon([[62,192],[310,192],[62,50]],C.panel,C.blue)+point(62,192,'A',C.blue)+point(310,192,'B',C.blue)+point(62,50,'C',C.blue)+point(112,149,'u=.2，v=.3')+v(166,99,'A 权重=.5')+foot('u≥0，v≥0，u+v=.5≤1')),
  P('平面交点位于边外','点的 u+v 大于 1，超出 BC 边；t>0 仍不能使它成为三角形交点。',polygon([[62,192],[310,192],[62,50]],C.panel,C.blue)+line(62,50,310,192,C.orange,4)+point(211,107,'P',C.red)+v(143,52,'u=.6，v=.6',C.red)+line(211,107,162,135,C.red,2,'4 4')+foot('A 权重=−.2：拒绝命中'))),
 group('三个 slab 的进入和离开区间如何合并？',
  P('相交区间逐轴求交','每条色带是射线留在该轴范围内的参数区间。',note('每个轴给出一个 t 区间')+interval(74,1,5,'x',C.blue)+interval(119,2,4,'y',C.purple)+interval(164,3,6,'z',C.orange)+line(166,195,203,195,C.mint,9)+v(164,221,'交集 [3,4]',C.mint)+foot('进入=max(1,2,3)=3')),
  P('区间不重叠就整盒无交','无限直线能分别穿过两个 slab，却不能同时位于两者内部。',interval(91,1,2,'x',C.blue)+interval(151,3,5,'y',C.purple)+line(129,56,129,192,C.blue,1.5,'5 4')+line(166,56,166,192,C.purple,1.5,'5 4')+v(101,213,'进入 3 > 离开 2',C.red)+foot('区间交集为空：拒绝')),
  P('方向分量为零要分支','光线的 x 坐标始终为 2，永远不进入盒的 x∈[−1,1]。',rect(56,63,146,132,C.panel,C.blue)+arrow(274,204,274,46,C.orange)+v(78,98,'x∈[−1,1]')+v(239,133,'x=2',C.orange)+v(220,180,'dₓ=0',C.orange)+foot('平行且原点在 slab 外：无交'))),
 group('怎样避免自交，又不跳过薄物体或错误比较局部参数？',
  P('舍入误差造成自交','实际交点应在面上；向内舍入后的起点会马上再次击中当前表面。',surface(168)+circle(169,172,5,C.red)+arrow(169,172,275,67,C.red)+circle(173,168,5,C.orange)+v(32,67,'误差被放大展示',C.muted)+v(42,130,'起点略在面内',C.red)+v(215,154,'自身命中',C.orange)+foot('偏移方向与 tmin 要共同确定')),
  P('偏移过大跳过薄几何','绿色新起点越过了上方薄片，导致漏掉本该命中的物体。',surface(197)+rect(80,144,197,7,C.purple)+point(170,197,'p',C.blue)+arrow(170,197,170,91,C.mint)+circle(170,125,5,C.mint)+v(192,128,'偏移后',C.mint)+v(185,177,'薄片',C.purple)+foot('ε 要配合尺度，不能一味增大')),
  P('仿射变换保留同一参数','对象空间方向也按线性变换改变；若额外归一化，必须换算 t。',rect(28,56,135,144,C.panel,C.blue,6)+rect(196,56,137,144,C.panel,C.purple,6)+arrow(41,130,146,130,C.blue)+arrow(212,130,318,130,C.purple)+v(47,83,'世界空间',C.blue)+v(212,83,'对象空间',C.purple)+v(44,169,'o+t d')+v(209,169,'o′+t d′')+arrow(169,126,191,126,C.mint)+foot('相同 t；方向长度未必相同')))
],
15:[
 group('距离和接收面朝向分别怎样改变辐照度？',
  P('正对光源：余弦为 1','小面距点光源 2 m，按 I/r² 计算入射功率密度。',beam(0,2)),
  P('倾斜 60°：密度减半','相同来光被分摊到更大实际面积，单位面积接收量乘 cos60°。',beam(60,2)),
  P('距离加倍：密度变四分之一','面仍倾斜 60°，从 2 m 移到 4 m，距离因素与朝向因素相乘。',note('保持夹角 60°')+lamp(42,81)+polygon([[113,40],[153,83],[124,153],[86,111]],C.panel,C.blue)+polygon([[259,68],[308,119],[269,205],[220,153]],C.panel,C.purple)+line(45,86,271,137,C.orange,2,'5 4')+v(93,186,'r=2')+v(251,49,'r=4')+foot('E：1.00 → 0.25 W/m²'))),
 group('相同辐照度为什么不能决定镜面看到的图像？',
  P('方向分布可以不同','均匀环境与集中灯束可以有相同的余弦积分，但方向细节不同。',hemiFan({n:7,length:67,origin:[92,186]})+hemiFan({n:5,focus:true,length:120,origin:[269,186]})+v(46,221,'均匀环境')+v(214,221,'集中来光')+foot('E 可相同；L(ω) 可以完全不同')),
  P('分母使用投影面积','表面倾斜时，垂直于光线的有效面积为实际面积乘余弦。',polygon([[107,66],[253,151],[230,192],[83,107]],C.panel,C.blue)+arrow(120,33,120,128,C.orange)+arrow(200,33,200,175,C.orange)+line(83,107,83,201,C.muted,1.3,'4 4')+line(230,192,230,201,C.muted,1.3,'4 4')+line(83,201,230,201,C.mint,5)+v(222,113,'dA',C.blue)+v(91,224,'dA⊥=dA cosθ',C.mint)+foot('L：W/(m²·sr)')),
  P('常量半球辐亮度的积分','立体角中的 sinθ 与表面投影的 cosθ 都必须保留。',chart(t=>Math.sin(t*Math.PI/2)*Math.cos(t*Math.PI/2),{max:.55,color:C.mint})+v(64,46,'sinθ cosθ')+v(37,225,'0°')+v(279,225,'90°')+v(186,73,'曲线面积=.5')+foot('L=3：E=πL≈9.425 W/m²'))),
 group('BRDF 大于 1 是否一定违反能量守恒？为什么 Lambert 要除以 π？',
  P('Lambert 的归一化','ρ=.6 时，常量 BRDF 必须是 .6/π，使余弦积分回到 .6。',outFan('diffuse')+v(35,214,'所有出射方向 L 相同')+foot('fᵣ=.6/π≈.191 sr⁻¹')),
  P('窄波瓣允许较大点值','方向密度集中在小区域，峰值可超过 1；守恒检查积分而非峰值。',chart(t=>3.5*Math.exp(-Math.pow((t-.55)/.05,2)),{max:4})+v(40,49,'峰值 3.5 sr⁻¹',C.mint)+v(210,216,'窄方向范围')+foot('需检验 ∫fᵣ cosθ dω≤1')),
  P('漏掉 π 会产生额外能量','若误把 fᵣ 设为 .6，半球余弦积分得到 .6π，已经大于 1。',bars([1,.6,.6*Math.PI],63,194,247,130,[C.blue,C.mint,C.red])+v(59,221,'入射')+v(142,221,'正确')+v(221,221,'错误')+v(52,54,'1.0')+v(141,144,'.6')+v(218,47,'1.885',C.red)+foot('ρ=.6 ≠ 常量 BRDF=.6'))),
 group('出射辐亮度的来源有哪些？反射项为什么还依赖其他表面？',
  P('将各入射方向贡献相加','两个灯的贡献经 BRDF、余弦和可见性加权后累加。',surface(193)+lamp(63,61)+lamp(302,76)+arrow(67,76,179,193,C.orange)+arrow(290,87,179,193,C.purple)+arrow(179,193,252,53,C.mint)+v(29,137,'入射 1',C.orange)+v(258,157,'入射 2',C.purple)+v(185,83,'出射',C.mint)+foot('Lᵣ = ∫ Lᵢ fᵣ cosθ dω')),
  P('自发光也能直接贡献','渲染方程同时包含自发光和反射；普通不发光表面的 Lₑ 为零。',rect(44,97,273,76,C.panel,C.blue,8)+v(64,129,'Lₒ = Lₑ + Lᵣ')+arrow(77,90,77,52,C.orange)+arrow(241,90,282,49,C.mint)+v(45,203,'自发光',C.orange)+v(235,203,'反射',C.mint)+foot('二者属于不同来源，可逐项调试')),
  P('另一个表面的出射成为入射','沿连线方向，红墙出射光成为地面的入射光，使方程相互耦合。',surface(196)+rect(280,45,18,151,C.red)+lamp(46,45)+arrow(55,59,280,98,C.orange)+arrow(280,98,149,196,C.red)+arrow(149,196,58,114,C.mint)+eye(42,103)+v(185,157,'Lₒ(墙)→Lᵢ(地)')+foot('无损均匀介质沿光线保持 L'))),
 group('颜色渗透从哪一条光路进入？增加样本能替代增加反弹吗？',
  P('白表面得到红墙间接光','灯先照红墙，墙面反射再照白表面；颜色来自非零的二跳传输。',rect(279,47,19,157,C.red)+surface(202)+lamp(64,49)+arrow(74,61,279,96,C.orange)+arrow(279,96,142,202,C.red)+arrow(142,202,48,138,C.mint)+eye(34,126)+v(88,224,'白地面接收到红光',C.red)+foot('局部直接光无法产生这一通路')),
  P('逐跳贡献叠加','示例贡献随跳数减小，但是否可忽略取决于材质、遮挡和目标误差。',bars([.50,.20,.08,.032],48,199,273,129,[C.orange,C.red,C.purple,C.blue])+v(54,222,'直接')+v(124,222,'二跳')+v(192,222,'三跳')+v(261,222,'四跳')+v(41,49,'示例贡献 .50/.20/.08/.032')+foot('更多样本不能补回被截断的路径')),
  P('高反照率让长路径更重要','相同初始权重下，ρ=.8 的衰减明显慢于 ρ=.4。',chart(t=>Math.pow(.8,t*6),{color:C.mint})+spark(Array.from({length:81},(_,i)=>Math.pow(.4,i/80*6)),{x:48,y:204,w:272,h:142,color:C.purple})+v(206,76,'ρ=.8',C.mint)+v(204,158,'ρ=.4',C.purple)+v(51,226,'跳数 0 → 6')+foot('throughput 的衰减依赖材质'))),
 group('概率是密度的积分，为什么密度点值可以大于 1？',
  P('离散随机变量的期望','两个结果的概率不同，期望需按概率加权，而非简单平均结果。',bars([.25,.75],71,170,221,110,[C.blue,C.orange])+v(64,197,'X=0')+v(210,197,'X=4')+v(66,97,'p=.25',C.blue)+v(210,50,'p=.75',C.orange)+foot('E[X]=0×.25+4×.75=3')),
  P('均匀密度依赖区间长度','在 [0,2] 均匀采样，密度为 .5，矩形积分为 1。',rect(61,104,241,86,'#274a48',C.mint)+line(61,190,324,190,C.muted)+line(61,190,61,58,C.muted)+v(21,110,'.5')+v(52,218,'0')+v(293,218,'2')+text(181,155,'概率 = 密度 × 长度',C.mint,16,'middle')+foot('∫₀² p(x) dx = .5×2 = 1')),
  P('短区间可以有高密度','在长度 .25 的区间内均匀分布，p=4 合法，总概率仍为 1。',rect(146,53,58,137,'#274a48',C.mint)+line(51,190,316,190,C.muted)+line(51,190,51,45,C.muted)+line(51,53,205,53,C.muted,1.5,'4 4')+v(20,61,'4')+v(127,217,'0')+v(191,217,'.25')+v(216,101,'密度高')+foot('点值 p=4；概率 4×.25=1')))
],
16:[
 group('采样分布改变后，为什么每个样本必须用 f/p 补偿？',
  P('均匀采样估计积分','在 [0,2] 取四个对称样本；每个 f(x)/p(x)=2x。',chart(t=>2*t,{max:2,color:C.blue})+[.125,.375,.625,.875].map(t=>circle(48+272*t,204-142*t,5,C.orange)).join('')+v(47,49,'f(x)=x；p=.5')+v(47,225,'0')+v(302,225,'2')+foot('本组估计平均 2x = 2')),
  P('与函数匹配的采样','p(x)=x/2 与 f 同形；除以新密度后，所有非零样本权重恰为 2。',chart(t=>t,{max:1,color:C.purple})+v(74,48,'p(x)=x/2')+[.2,.4,.65,.85].map(t=>circle(48+272*t,204-142*t,5,C.orange)).join('')+v(93,151,'x / (x/2) = 2',C.mint)+foot('同一积分，理想匹配可消除方差')),
  P('不能遗漏非零贡献区间','若 p 在 x>1 为零，右半区永远不被采样，无法恢复完整积分。',chart(t=>2*t,{max:2,color:C.blue})+rect(184,53,136,151,'#542b3b')+polyline([[48,62],[184,62],[184,204],[320,204]],C.orange)+v(54,43,'有采样')+v(204,99,'遗漏',C.red)+v(201,128,'x>1',C.red)+foot('f≠0 的区域必须满足 p>0'))),
 group('无偏是怎样跨重复实验定义的？一次噪声降低多少需要多少样本？',
  P('单张结果仍会偏离真值','八次独立实验的估计落在真值两侧；期望不是每次结果。',note('每个点是一组独立估计')+cloud([113,143,164,208,226,183,196,207])+v(191,81,'真值',C.mint)+v(34,217,'有限样本仍有随机误差')+foot('无偏：重复实验的 E[Î]=I')),
  P('典型噪声按平方根下降','曲线是标准误差比例 1/√N；四倍样本通常只减半噪声。',chart(t=>1/Math.sqrt(1+t*63),{max:1})+v(44,49,'标准误差 ∝ 1/√N')+v(43,225,'N=1')+v(278,225,'64')+circle(113,168.5,5,C.orange)+v(146,105,'16 → 64')+v(146,132,'噪声约减半',C.orange)+foot('个别像素误差不保证单调下降')),
  P('偏差与噪声是两种误差','紫色结果密集但中心偏离真值；蓝色结果分散但中心在真值附近。',cloud([173,176,180,184,187,180,177,183],{y:103,target:135,color:C.purple})+cloud([97,116,140,150,121,134,160,161],{y:167,target:135,color:C.blue})+v(197,87,'低方差有偏',C.purple)+v(199,164,'较高方差',C.blue)+foot('MSE = 方差 + 偏差²'))),
 group('为什么通常每跳只延续一条路径，而把预算分配到更多独立路径？',
  P('每跳分叉导致指数增长','这里每个顶点生成两条后续光线，三层已产生八个叶子。',circle(180,41,5,C.orange)+[90,270].map(x=>line(180,41,x,89,C.blue)+circle(x,89,5,C.blue)).join('')+[45,135,225,315].map((x,i)=>line(i<2?90:270,89,x,140,C.purple)+circle(x,140,5,C.purple)).join('')+Array.from({length:8},(_,i)=>{const x=24+i*44.5;return line([45,135,225,315][Math.floor(i/2)],140,x,194,C.mint)+circle(x,194,4,C.mint);}).join('')+foot('每跳 2 分叉：叶子数 2ᴰ')),
  P('一条随机路径逐跳延续','每个顶点只延续一个方向；多条独立路径的平均覆盖方向积分。',surface(201)+rect(293,42,16,159,C.red)+eye(35,85)+polyline([[45,92],[154,201],[293,101],[141,55]],C.mint,3)+[ [154,201],[293,101],[141,55] ].map((p,i)=>circle(...p,5,[C.blue,C.red,C.orange][i])).join('')+v(87,149,'1')+v(219,159,'2')+v(210,64,'3')+foot('按方向 PDF 随机追踪，再平均')),
  P('余弦加权与 Lambert 抵消','分子与采样密度都有 cosθ/π，这一匹配才让单次权重简化为 ρ。',hemiFan({n:9,length:102})+v(35,48,'fᵣ=ρ/π',C.blue)+v(220,48,'p=cosθ/π',C.purple)+rect(73,205,211,24,C.panel,C.mint,3)+text(180,223,'fᵣ cosθ / p = ρ',C.mint,16,'middle')+foot('ρ=.7：每跳 β 乘 .7'))),
 group('俄罗斯轮盘终止后，应该补偿哪一部分贡献？',
  P('存活样本除以存活概率','四条示意路径里一条存活；其后续贡献从 .6 变为 2.4。',[0,1,2,3].map(i=>{const x=61+i*77;return arrow(x,62,x,142,i===2?C.mint:C.red)+circle(x,159,8,i===2?C.mint:C.red)+text(x,194,i===2?'2.4':'0',i===2?C.mint:C.red,18,'middle');}).join('')+note('q=.25，后续原贡献 C=.6')+foot('期望 .25×2.4=.6')),
  P('不补偿会系统性变暗','存活后仍返回 .6，会使期望降为 .15，不能靠更多样本修复。',bars([.6,.15],80,191,203,133,[C.mint,C.red])+v(80,219,'正确期望')+v(206,219,'未补偿')+v(76,47,'.60',C.mint)+v(209,144,'.15',C.red)+foot('错误期望 qC=.25×.6=.15')),
  P('已累计的直接光不重复补偿','先累计 D=.2；轮盘只处理未来 C=.6，保持原直接项。',rect(33,77,129,90,C.panel,C.blue,7)+rect(197,77,129,90,C.panel,C.mint,7)+text(97,111,'直接 D=.2',C.blue,16,'middle')+text(97,143,'已累计',C.blue,16,'middle')+text(261,111,'后续 C=.6',C.mint,16,'middle')+text(261,143,'存活才 ÷q',C.mint,16,'middle')+arrow(169,120,191,120,C.orange)+foot('总期望 D+q(C/q)=.8'))),
 group('很小的面积灯为什么需要直接采样？两个端点的余弦来自哪里？',
  P('半球采样很难碰到小灯','大部分方向错过灯，贡献为零；小灯占据的立体角决定命中难度。',surface(203)+rect(277,54,25,9,C.orange)+Array.from({length:13},(_,i)=>{const a=-1.3+i*.21;return arrow(177,203,177+Math.sin(a)*151,203-Math.cos(a)*151,C.grid,1.7);}).join('')+arrow(177,203,285,64,C.mint,3)+v(252,43,'小灯',C.orange)+foot('均匀半球：命中概率常很低')),
  P('直接在灯面上选点','连接采样点并检查遮挡，每个样本都朝向灯，但并非都可见。',surface(202)+rect(236,45,92,9,C.orange)+[241,260,280,300,321].map(x=>arrow(176,202,x,54,C.mint,2)).join('')+rect(204,120,42,17,C.red)+v(21,87,'选灯面位置',C.orange)+v(32,135,'仍检查遮挡',C.red)+foot('灯面 PDF 的单位为 m⁻²')),
  P('面积 PDF 转换到方向 PDF','光源端投影和距离决定灯片张角，接收端余弦再进入贡献。',surface(199)+point(99,199,'p')+line(251,60,318,96,C.orange,5)+arrow(99,199,282,78,C.mint)+arrow(99,199,99,107,C.blue)+arrow(282,78,248,141,C.purple)+v(78,94,'n',C.blue)+v(242,162,'nₗ',C.purple)+v(190,183,'距离 r')+foot('pω = pA r² / |cosθₗ|'))),
 group('直接光和延续路径的发光命中，如何避免把同一贡献算两次？',
  P('同一条路径能被两种技术生成','显式灯采样与 BRDF 方向采样，都可能生成同一条表面到灯的连接。',surface(199)+lamp(284,67)+arrow(163,199,284,80,C.mint,4)+line(170,199,291,80,C.purple,2,'5 4')+v(24,80,'技术 A：灯采样',C.mint)+v(24,111,'技术 B：BRDF',C.purple)+foot('把两项都完整累加可能重复计数')),
  P('MIS 权重合为 1','对同一完整路径的多个生成策略按正确 PDF 分配权重。',rect(40,67,278,45,C.panel,C.mint,5)+rect(40,141,278,45,C.panel,C.purple,5)+v(65,96,'策略 A：贡献 × wA',C.mint)+v(65,170,'策略 B：贡献 × wB',C.purple)+foot('同路径：wA + wB = 1')),
  P('理想镜面连接需要特殊处理','镜面只允许约束方向，不能用普通有限 BRDF 任意连接光源。',surface(196)+arrow(48,55,179,196,C.blue)+arrow(179,196,308,55,C.mint,3.5)+lamp(81,77)+line(179,196,85,94,C.red,2,'5 4')+v(232,175,'合法方向',C.mint)+v(24,130,'任意连接',C.red)+foot('delta 路径与普通半球密度不同'))),
 group('累积的是同一个成像问题吗？像素内位置改变会影响什么？',
  P('像素面积内的子样本','网格覆盖同一像素；不同样本可能分属几何与背景，决定抗锯齿结果。',rect(84,53,182,159,C.panel,C.blue)+polygon([[84,53],[266,53],[84,212]],'#27463e','none')+[ [108,76],[184,77],[238,81],[112,143],[191,142],[238,182],[146,188] ].map(([x,y])=>circle(x,y,5,(x-84)/182+(y-53)/159<1?C.mint:C.orange)).join('')+v(27,25,'同一像素内采样')+foot('像素采样平均的是覆盖后的颜色')),
  P('均值可以增量更新','样本依次为 1、3、2，累计平均为 1、2、2，无需保存全部历史。',bars([1,2,2],70,194,218,115,[C.blue,C.mint,C.purple])+v(76,222,'n=1')+v(152,222,'n=2')+v(223,222,'n=3')+v(42,50,'新样本：1 → 3 → 2')+foot('Cₙ=Cₙ₋₁+(Xₙ−Cₙ₋₁)/n')),
  P('相机改变后必须清空累计','旧视图和新视图来自不同积分问题，混在一个平均中会形成重影。',rect(28,57,133,142,C.panel,C.blue,5)+rect(199,57,133,142,C.panel,C.mint,5)+circle(64,124,24,C.blue)+circle(127,124,24,'none',C.red)+circle(263,124,25,C.mint)+v(30,225,'旧样本混合',C.red)+v(212,225,'清零后累积',C.mint)+arrow(168,125,192,125,C.orange)+foot('改相机/场景 → 重置 n 与缓冲')))
],
14:[
 group('格子里登记了物体，为什么仍不能马上返回交点？',
  P('按穿越次序访问网格','只测试射线经过的格子中的候选；仍需精确求交。',grid(38,48,280,160,40)+[[58,68],[180,73],[291,180],[229,118],[99,183]].map(([x,y])=>circle(x,y,9,C.purple)).join('')+[0,1,2,3,4,5,6].map(i=>rect(38+i*40,128,40,40,'#244439')).join('')+arrow(25,149,333,149,C.mint)+v(73,103,'候选在经过的格子里')+foot('跨格顺序按参数 t 递增')),
  P('空域加密集区不适合固定网格','大片空格仍需跨越，右侧少数格子又包含许多物体。',grid(38,48,280,160,40)+samplePoints(45,{x:247,y:133,w:56,h:56,color:C.purple})+arrow(24,153,333,153,C.mint)+v(79,94,'很多空格',C.muted)+v(221,108,'密集区',C.purple)+foot('分辨率增加 ≠ 一定更快')),
  P('候选命中可能在下一格','长三角形在第一格登记，但实际交点晚于该格出口。',grid(39,61,280,126,70)+polygon([[51,175],[266,80],[313,179]],'none',C.purple)+arrow(26,137,333,137,C.mint)+circle(137,137,5,C.orange)+line(109,54,109,201,C.blue,2,'5 4')+v(63,46,'格出口 t=2',C.blue)+v(154,214,'命中 t=2.4',C.orange)+foot('t_hit > t_exit：必须继续遍历'))),
 group('被切开的究竟是空间，还是原语集合？',
  P('KD-tree：用平面划空间','橙色物体跨越分割平面，可能在左右两叶中各保存一个引用。',rect(33,49,291,155,C.panel,C.blue)+rect(33,49,145,155,'#183646')+rect(178,49,146,155,'#332a48')+line(178,49,178,204,C.mint,4)+polygon([[80,180],[277,91],[235,188]],'none',C.orange)+v(62,82,'左空间',C.blue)+v(224,82,'右空间',C.purple)+foot('子空间分离，引用可以重复')),
  P('BVH：原语分组后求盒','两组交叉细长原语各只存一次，但其轴对齐盒大幅重叠。',polygon([[51,69],[294,159],[64,91]],'none',C.blue)+polygon([[283,70],[57,161],[290,90]],'none',C.purple)+rect(48,66,249,96,'none',C.blue)+rect(54,67,239,97,'none',C.purple)+v(52,196,'对象 A',C.blue)+v(231,196,'对象 B',C.purple)+foot('对象归属分离，包围盒可重叠')),
  P('移动对象后重新包围','同一对象集合运动后可更新盒边界，正确性与分组效率分别检查。',rect(32,59,119,112,'none',C.blue)+circle(55,80,11,C.blue)+circle(118,143,11,C.blue)+arrow(165,116,194,116,C.mint)+rect(215,50,113,151,'none',C.purple)+circle(234,74,11,C.purple)+circle(310,188,11,C.purple)+v(41,210,'运动前')+v(229,224,'运动后')+foot('重新包围不保证树仍高效'))),
 group('BVH 分割后规模是否减小？包围盒是否覆盖真实边界？',
  P('按质心中位数分组','六个质心分成三个与三个，递归规模明确减小。',line(31,128,327,128,C.muted)+[45,68,91,244,267,290].map((x,i)=>circle(x,128,7,i<3?C.blue:C.purple)).join('')+rect(34,92,70,73,'none',C.blue)+rect(233,92,69,73,'none',C.purple)+line(177,63,177,194,C.mint,2,'5 4')+v(39,191,'0、1、2',C.blue)+v(230,191,'8、9、10',C.purple)+foot('中位数划分：3 + 3')),
  P('盒必须使用对象边界','质心小的长物体仍可能伸得很远，不能只包住几个质心。',rect(31,88,91,106,'none',C.red)+rect(31,68,263,126,'none',C.mint)+polygon([[35,106],[277,121],[35,137]],C.panel,C.orange)+circle(116,121,5,C.purple)+v(34,54,'真实包围盒',C.mint)+v(124,160,'长物体延伸',C.orange)+v(35,221,'红盒只包质心：错误',C.red)+foot('父盒包含每个原语的完整边界')),
  P('退化划分需要兜底','所有质心相同时，位置判定可能得到空子集；按数量分割可终止。',tree([0,6],true)+v(54,25,'相同质心 → 空侧',C.red)+foot('检测退化，再按索引分为 3 + 3'))),
 group('先访问的盒为什么不一定包含最近交点？',
  P('先发现 t=8，仍要检查 t=3','左盒入口更早，但里面物体更远；右侧实际交点更近。',rect(73,55,227,49,'none',C.blue)+rect(105,119,87,49,'none',C.purple)+arrow(29,190,327,190,C.mint)+line(73,104,73,194,C.blue,1.4,'5 4')+line(105,168,105,194,C.purple,1.4,'5 4')+v(89,84,'入口 1；交点 8',C.blue)+v(117,149,'2 → 3',C.purple)+foot('第一个命中不等于最近命中')),
  P('用当前最佳值缩短区间','已有 tbest=3；远盒最早 t=10，无法改进当前答案。',arrow(30,131,330,131,C.mint)+circle(105,131,5,C.mint)+rect(247,83,70,100,C.panel,C.red)+line(105,59,105,201,C.mint,2,'5 4')+v(65,48,'tbest=3',C.mint)+v(229,68,'入口=10',C.red)+v(228,209,'整枝剪掉',C.red)+foot('下界 > tbest：安全剪枝')),
  P('阴影查询只求任意遮挡','灯在 t=5；t=3 的交点足以证明遮挡，t=8 不在合法线段内。',arrow(30,135,330,135,C.blue)+circle(129,135,13,C.purple)+lamp(195,135)+circle(294,135,16,C.panel,C.red)+v(110,91,'t=3',C.purple)+v(172,195,'灯 t=5',C.orange)+v(271,91,'t=8',C.red)+foot('最近命中与任意命中契约不同'))),
 group('每次除以时间、面积或方向域，会得到什么物理量？',
  P('功率随时间累计成能量','恒定 2 W 发光 3 s，图中矩形面积表示输出的能量。',rect(57,89,240,110,'#2a4a48',C.mint)+line(57,199,318,199,C.muted)+line(57,199,57,45,C.muted)+v(17,91,'2 W')+v(46,225,'0')+v(282,225,'3 s')+text(177,145,'矩形面积 = 6 J',C.mint,17,'middle')+foot('Q=Φ Δt；Φ 的单位是 W')),
  P('同样功率可集中到小方向锥','两盏理想化光源总功率都是 12 W；方向分布不同。',circle(87,123,8,C.orange)+Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return arrow(87,123,87+67*Math.cos(a),123+67*Math.sin(a),C.orange,2);}).join('')+circle(220,123,8,C.orange)+[-.23,-.12,0,.12,.23].map(a=>arrow(220,123,328,123+95*Math.sin(a),C.orange,2)).join('')+v(39,214,'整个球面')+v(218,214,'0.5 sr 锥')+foot('I：0.955 与 24 W/sr')),
  P('单位能帮助检查公式','先除以秒得到通量，再按方向分配得到强度，面积量留到后面。',rect(36,71,81,73,C.panel,C.blue,6)+rect(141,71,80,73,C.panel,C.purple,6)+rect(245,71,81,73,C.panel,C.orange,6)+text(76,101,'Q',C.blue,20,'middle')+text(76,129,'J',C.blue,18,'middle')+text(181,101,'Φ',C.purple,20,'middle')+text(181,129,'W',C.purple,18,'middle')+text(285,101,'I',C.orange,20,'middle')+text(285,129,'W/sr',C.orange,16,'middle')+arrow(120,107,137,107,C.mint)+arrow(224,107,241,107,C.mint)+v(118,184,'÷s')+v(228,184,'÷sr')+foot('总功率 Φ = ∫ I(ω) dω'))),
 group('相同面积的灯，为什么远一点或斜一点会占据更少方向？',
  P('球面积除以半径平方','同一个方向锥投到更大球面，面积按 r² 增大而立体角不变。',circle(44,174,5,C.orange)+path('M 96.34 100.83 A 90 90 0 0 1 133.89 178.5',C.blue)+path('M 148.68 27.66 A 180 180 0 0 1 223.78 183',C.purple)+arrow(44,174,148.68,27.66,C.mint)+arrow(44,174,223.78,183,C.mint)+v(99,211,'r=1',C.blue)+v(237,221,'r=2',C.purple)+v(173,104,'同一个方向锥')+foot('A 增为 4 倍，Ω=A/r² 不变')),
  P('用灯的投影面积换算方向域','小片法线与视线约夹 60°，投影面积约减半；距离不变时张角也近似减半。',point(42,181,'p',C.blue)+polygon([[302,70],[322,78],[252,155],[232,147]],C.panel,C.orange)+line(42,181,302,70,C.muted,1.4,'5 4')+line(42,181,232,147,C.muted,1.4,'5 4')+line(205,100,221,150,C.mint,5)+line(205,100,302,70,C.mint,1.2,'4 4')+line(221,150,232,147,C.mint,1.2,'4 4')+v(172,205,'A⊥≈A cos60°')+v(251,185,'灯片',C.orange)+foot('小片近似：Ω≈.5 A/r²')),
  P('等 θ 间隔并非等方向面积','等纬向角宽的两条带，在球顶更窄；均匀方向应均匀采样 cosθ。',circle(180,131,78,C.panel,C.blue)+path('M 108 99 Q 180 118 252 99',C.orange)+path('M 119 80 Q 180 99 241 80',C.orange)+path('M 103 127 Q 180 150 257 127',C.mint)+path('M 104 149 Q 180 172 256 149',C.mint)+v(18,70,'极区小',C.orange)+v(19,188,'赤道大',C.mint)+line(74,74,130,85,C.orange)+line(75,181,126,152,C.mint)+foot('dω = sinθ dθ dφ')))
]
};
