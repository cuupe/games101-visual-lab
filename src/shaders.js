export const vertex = `
attribute vec3 aPosition,aNormal,aColor,aAnchor;
uniform mat4 uMVP,uModel,uLightMatrix;
uniform vec3 uEye,uLight;
uniform float uKd,uKs,uShininess,uAmbient;
uniform int uMode;
varying vec3 vNormal,vPosition,vColor,vLit;
varying vec4 vShadow;
vec3 light(vec3 pos,vec3 n,vec3 color){
 vec3 l=normalize(uLight),v=normalize(uEye-pos),h=normalize(l+v);
 float diffuse=max(dot(n,l),0.0);
 return color*(uAmbient+uKd*diffuse)+vec3(uKs*pow(max(dot(n,h),0.0),uShininess)*step(0.001,diffuse));
}
void main(){
 vec4 world=uModel*vec4(aPosition,1.0);
 vPosition=world.xyz;vNormal=normalize(mat3(uModel)*aNormal);vColor=aColor;
 vec3 anchor=uMode==1?(uModel*vec4(aAnchor,1.0)).xyz:world.xyz;
 vLit=light(anchor,vNormal,aColor);vShadow=uLightMatrix*world;
 gl_Position=uMVP*vec4(aPosition,1.0);gl_PointSize=3.0;
}`;
export const fragment = `
precision highp float;
varying vec3 vNormal,vPosition,vColor,vLit;
varying vec4 vShadow;
uniform vec3 uEye,uLight;
uniform float uKd,uKs,uShininess,uAmbient,uRoughness,uMetallic,uF0,uBias;
uniform int uMode,uShadow;
uniform sampler2D uTexture,uDepth;
float unpack(vec4 d){return dot(d,vec4(1.0/16777216.0,1.0/65536.0,1.0/256.0,1.0));}
vec3 encode(vec3 c){c=max(c,vec3(0));return mix(12.92*c,1.055*pow(c,vec3(1.0/2.4))-.055,step(vec3(.0031308),c));}
void main(){
 if(uMode==0){gl_FragColor=vec4(vColor,1.0);return;}
 if(uMode==4){gl_FragColor=vec4(texture2D(uTexture,vColor.xy).rgb,1.0);return;}
 vec3 n=normalize(vNormal),l=normalize(uLight),v=normalize(uEye-vPosition),h=normalize(l+v);
 float nl=max(dot(n,l),0.0),nv=max(dot(n,v),0.001);
 vec3 c;
 if(uMode<=2)c=vLit;
 else if(uMode==5){
  float a=uRoughness*uRoughness,a2=a*a,nh=max(dot(n,h),0.0),vh=max(dot(v,h),0.0);
  float d=a2/(3.14159265*pow(nh*nh*(a2-1.0)+1.0,2.0));
  float k=pow(uRoughness+1.0,2.0)/8.0;
  float g=nv/(nv*(1.0-k)+k)*nl/(nl*(1.0-k)+k);
  vec3 f0=mix(vec3(uF0),vColor,uMetallic),f=f0+(1.0-f0)*pow(1.0-vh,5.0);
  vec3 brdf=(1.0-f)*(1.0-uMetallic)*vColor/3.14159265+d*g*f/(4.0*nv*max(nl,.001));
  c=brdf*nl*3.0+vColor*.025;c=c/(1.0+c);
 }else c=vColor*(uAmbient+uKd*nl)+vec3(uKs*pow(max(dot(n,h),0.0),uShininess)*step(.001,nl));
 if(uShadow==1){vec3 s=vShadow.xyz/vShadow.w*.5+.5;
  if(s.x>0.0&&s.x<1.0&&s.y>0.0&&s.y<1.0&&s.z<1.0){float d=unpack(texture2D(uDepth,s.xy));if(s.z-uBias>d)c*=.24;}
 }
 gl_FragColor=vec4(encode(c),1.0);
}`;
export const depthVertex=`attribute vec3 aPosition;uniform mat4 uMVP;void main(){gl_Position=uMVP*vec4(aPosition,1.0);}`;
export const depthFragment=`precision highp float;vec4 pack(float v){vec4 c=fract(v*vec4(16777216.0,65536.0,256.0,1.0));c-=c.xxyz*vec4(0.0,1.0/256.0,1.0/256.0,1.0/256.0);return c;}void main(){gl_FragColor=pack(gl_FragCoord.z);}`;
export const screenVertex=`attribute vec2 aPosition;varying vec2 vUv;void main(){vUv=aPosition*.5+.5;gl_Position=vec4(aPosition,0,1);}`;
export const screenFragment=`
precision highp float;
varying vec2 vUv;
uniform int uKind;uniform sampler2D uImage;
uniform float uAspect,uSeparation,uBlend,uSample,uEncoded;
float unpack(vec4 d){return dot(d,vec4(1.0/16777216.0,1.0/65536.0,1.0/256.0,1.0));}
vec3 encode(vec3 c){return mix(12.92*c,1.055*pow(max(c,vec3(0)),vec3(1.0/2.4))-.055,step(vec3(.0031308),c));}
void main(){
 if(uKind==0){float d=unpack(texture2D(uImage,vUv));gl_FragColor=vec4(vec3(1.0-d),1);return;}
 if(uKind==3){gl_FragColor=vec4(texture2D(uImage,vUv).rgb,1);return;}
 if(uKind==2){vec3 c=texture2D(uImage,vUv).rgb;if(uEncoded>.5)c/=max(vec3(1.0)-c,vec3(.0001));gl_FragColor=vec4(encode(c/(1.0+c)),1.0);return;}
 vec2 p=(vUv*2.0-1.0)*vec2(uAspect*2.2,2.2);
 float a=length(p-vec2(-uSeparation*.5,0.0))-.85,b=length(p-vec2(uSeparation*.5,0.0))-.85;
 float k=max(uBlend,.0001),h=clamp(.5+.5*(b-a)/k,0.0,1.0),d=mix(b,a,h)-k*h*(1.0-h);
 vec3 bg=vec3(.045,.065,.098),c=mix(vec3(.32,.74,.63),vec3(.56,.50,.95),h);
 float bands=1.0-smoothstep(.02,.065,abs(sin(d*19.0)));
 vec3 color=mix(bg,c*.30,bands*.5)*(.95-.08*length(p));
 if(d<0.0)color=mix(c*.20,c*.38,exp(d*1.5));
 color=mix(color,c,1.0-smoothstep(.008,.020,abs(d)));
 gl_FragColor=vec4(color,1.0);
}`;
export const pathFragment=`
precision highp float;
varying vec2 vUv;
uniform sampler2D uPrevious;
uniform vec2 uResolution;
uniform float uSample,uAlbedo,uSun,uAspect,uEncoded;
uniform int uBounces;
uniform vec3 uEye,uForward,uRight,uUp;
float seed;
float random(){seed=mod(seed*13.0+17.0,65521.0);return fract(sin(seed)*43758.5453123);}
float sphere(vec3 o,vec3 d,vec3 c,float r){vec3 oc=o-c;float b=dot(oc,d),h=b*b-dot(oc,oc)+r*r;if(h<0.0)return 1e8;h=sqrt(h);float t=-b-h;if(t>.001)return t;t=-b+h;return t>.001?t:1e8;}
bool hit(vec3 o,vec3 d,out vec3 p,out vec3 n,out vec3 color){
 float t=1e8;int id=-1;
 float a=sphere(o,d,vec3(-1.05,0.0,0),1.0);if(a<t){t=a;id=0;}
 a=sphere(o,d,vec3(1.05,-.25,.25),.75);if(a<t){t=a;id=1;}
 a=sphere(o,d,vec3(.1,-.45,-1.45),.55);if(a<t){t=a;id=2;}
 if(d.y<-.00001){a=(-1.0-o.y)/d.y;if(a>.001&&a<t){t=a;id=3;}}
 if(id<0)return false;
 p=o+d*t;
 if(id==0){n=normalize(p-vec3(-1.05,0,0));color=vec3(.62,.38,.92);}
 if(id==1){n=normalize(p-vec3(1.05,-.25,.25));color=vec3(.22,.86,.59);}
 if(id==2){n=normalize(p-vec3(.1,-.45,-1.45));color=vec3(.94,.54,.28);}
 if(id==3){n=vec3(0,1,0);color=vec3(.85);}
 color*=uAlbedo;return true;
}
vec3 sky(vec3 d){vec3 sun=normalize(vec3(sin(uSun),.8,cos(uSun)));float bright=pow(max(dot(sun,d),0.0),24.0)*2.5;return mix(vec3(.12,.16,.23),vec3(.5,.65,.9),clamp(d.y*.5+.5,0.0,1.0))+vec3(1.0,.9,.7)*bright;}
void main(){
 seed=mod(dot(gl_FragCoord.xy,vec2(1973.0,9277.0))+uSample*26699.0+37.0,65521.0);
 vec2 jitter=vec2(random(),random())-.5;
 vec2 uv=(vUv+jitter/uResolution)*2.0-1.0;
 vec3 o=uEye,d=normalize(uForward+uv.x*uAspect*.44*uRight+uv.y*.44*uUp),throughput=vec3(1),radiance=vec3(0);
 for(int bounce=0;bounce<7;bounce++){
  vec3 p,n,col;
  if(!hit(o,d,p,n,col)){radiance+=throughput*sky(d);break;}
  if(bounce>=uBounces)break;
  float a=6.2831853*random(),r=sqrt(random());
  vec3 tangent=normalize(cross(abs(n.y)<.9?vec3(0,1,0):vec3(1,0,0),n));
  vec3 bitangent=cross(n,tangent);
  d=normalize(tangent*r*cos(a)+bitangent*r*sin(a)+n*sqrt(max(0.0,1.0-r*r)));
  o=p+n*.002;throughput*=col;
 }
 vec3 prev=texture2D(uPrevious,vUv).rgb;
 if(uEncoded>.5)prev/=max(vec3(1)-prev,vec3(.0001));
 vec3 mean=(prev*uSample+radiance)/(uSample+1.0);
 if(uEncoded>.5)mean=mean/(1.0+mean);
 gl_FragColor=vec4(mean,1.0);
}`;
