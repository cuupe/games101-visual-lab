"""Create auditable browser working copies; keep official-N.json immutable."""
from pathlib import Path, PurePosixPath
import json,re,zipfile,base64,io
from PIL import Image
root=Path(__file__).resolve().parents[1]
out=root/'public/homework'
titles=['环境与线性代数','旋转与投影','三角形光栅化','着色与纹理','Bézier 曲线','Whitted 光线追踪','BVH 加速','路径追踪','质点弹簧绳索']
focus=['main.cpp','main.cpp','rasterizer.cpp','main.cpp','main.cpp','Renderer.cpp','BVH.cpp','Scene.cpp','rope.cpp']
tasks=[
 ['运行官方 Eigen 示例，修改向量和矩阵，验证点积与矩阵乘法。','按原题完成旋转 45° 再平移的二维齐次变换。'],
 ['在 main.cpp 完成 get_model_matrix 和 get_projection_matrix。','先验证恒等变换，再验证近远裁剪面；初始模板尚未完成投影。'],
 ['完成 insideTriangle 和 rasterize_triangle，建立深度缓冲。','测试反向提交三角形后图像是否一致，再尝试超采样。'],
 ['完成投影与光栅化、Phong/texture/bump/displacement 着色器。','命令参数填 output.png normal 或 output.png phong 选择着色器；贴图已由官方资源转成 PPM。'],
 ['先运行红色的官方直接公式曲线，再在 recursive_bezier 中实现 de Casteljau。','实现 bezier 后用绿色通道绘制，比较两种算法是否重合；控制点在 main.cpp 中可改。'],
 ['完成 Renderer.cpp 的像素射线与 Triangle.hpp 的三角形求交。','检查射线归一化和最近命中；初始安全占位不会给出正确画面。'],
 ['完成 Bounds3::IntersectP、BVH::getIntersection 与主光线生成。','先用少量射线核验，再比较加速结构与逐个三角形测试。'],
 ['补齐 BVH/AABB，并在 Scene::castRay 实现路径追踪。','区分直接光与间接光、检查 PDF 与俄罗斯轮盘；初始空算法输出黑图是预期。'],
 ['在 rope.cpp 构造质点与弹簧，并实现 Euler、Verlet 与阻尼。','web_main.cpp 设置时间步与重力；终态写入 rope.csv，可以在网页查看位置。']]

def stub_function(text,signature,result):
    at=text.find(signature)
    if at<0:return text
    start=text.find('{',at);depth=1;j=start+1
    while depth and j<len(text):
        if text[j]=='{':depth+=1
        elif text[j]=='}':depth-=1
        j+=1
    body=text[start+1:j-1]
    # Only empty TODO functions; never replace an implemented algorithm.
    stripped=re.sub(r'//[^\n]*|/\*[\s\S]*?\*/','',body).strip()
    if not stripped:return text[:j-1]+f'\n    // WEB ADAPTER: safe placeholder; replace when completing this TODO.\n    return {result};\n'+text[j-1:]
    return text

for n in range(9):
 official=json.loads((out/f'official-{n}.json').read_text(encoding='utf8'))
 files=[];adaptations=[]
 for f in official['files']:
  p=PurePosixPath(f['path']);name=p.name
  if n==8:
   if '/src/' not in f['path'] or name not in ['rope.cpp','rope.h','mass.h','spring.h']:continue
   path=name
  elif 'models' in p.parts:path='/'.join(p.parts[p.parts.index('models'):])
  elif name.endswith(('.cpp','.hpp','.h')) or name=='CMakeLists.txt':path=name
  else:continue
  text=f['content'];original=text
  if n in [1,2,3]:
   text=re.sub(r'\b700\b','320',text)
   text=text.replace('Eigen::Matrix4f projection;', 'Eigen::Matrix4f projection = Eigen::Matrix4f::Identity(); // WEB: defined initial TODO state')
  text=text.replace('../models/','models/')
  text=re.sub(r'throw std::runtime_error\(([^;]+)\);',r'{std::cerr << \1 << std::endl; std::abort();} // WEB: WASI has no C++ exceptions',text)
  if '#pragma once' in text:
   guard='WEB_'+re.sub('[^A-Za-z0-9]','_',path).upper()
   text=text.replace('#pragma once',f'#ifndef {guard}\n#define {guard}')+'\n#endif\n'

  for signature,result in [('get_projection_matrix(', 'Eigen::Matrix4f::Identity()'),('insideTriangle(', 'false'),('rayTriangleIntersect(', 'false'),('Bounds3::IntersectP(', 'false'),('BVHAccel::getIntersection(', 'Intersection{}'),('Scene::castRay(', 'Vector3f(0)')]:
   text=stub_function(text,signature,result)
  if n==1 and name=='rasterizer.cpp':
   at=text.find('void rst::rasterizer::set_pixel(')
   if at>=0:
    start=text.find('{',at)
    text=text[:start+1]+'\n    // WEB: incomplete projection can send pixels outside the buffer.\n    if(point.x()<0 || point.x()>=width || point.y()<0 || point.y()>=height) return;\n'+text[start+1:]
  if n==3:
   for signature in ['texture_fragment_shader(', 'phong_fragment_shader(', 'displacement_fragment_shader(', 'bump_fragment_shader(']:text=stub_function(text,signature,'Eigen::Vector3f::Zero()')
   if name=='Texture.hpp':
    text=text.replace('auto u_img = u * width;', 'auto u_img = std::max(0, std::min(width-1, int(u * width))); // WEB: clamp texel coordinates')
    text=text.replace('auto v_img = (1 - v) * height;', 'auto v_img = std::max(0, std::min(height-1, int((1-v) * height)));')
  if n==4 and name=='main.cpp':
   text=text.replace('std::vector<cv::Point2f> control_points;', 'std::vector<cv::Point2f> control_points = {{60,560},{180,60},{500,80},{640,560}}; // WEB: editable input instead of mouse clicks')
   text=text.replace('//   bezier(control_points, window);','bezier(control_points, window); // WEB: run the student implementation too')
  if n in [5,6,7]:
   text=text.replace('Scene scene(1280, 960)', 'Scene scene(160, 120) // WEB: small preview resolution\n').replace('Scene scene(784, 784)', 'Scene scene(96, 96) // WEB: small preview resolution\n')
   if n==5 and name=='Renderer.cpp':text=text.replace('float x;', 'float x=0; // WEB: safe placeholder; complete the TODO below').replace('float y;', 'float y=0; // WEB: safe placeholder; complete the TODO below')
  if text!=original:adaptations.append({'path':path,'reason':'WEB 注释标明初始化占位、缩小预览、资源路径、纹理边界或输入替换；教学 TODO 保留。'})
  files.append({'path':path,'content':text,'originalPath':f['path']})
 if n in [1,2,3,4]:
  files.append({'path':'opencv2/opencv.hpp','content':(root/'scripts/web-opencv.hpp').read_text(encoding='utf8')})
  files.append({'path':'opencv2/core/core.hpp','content':'#include "../opencv.hpp"\n'})
  adaptations.append({'path':'opencv2/opencv.hpp','reason':'本站兼容层只实现此作业使用的 Mat/像素/PPM 子集；桌面窗口改为输出图像，一次运行只绘制一帧。'})
 if n==3:
  with zipfile.ZipFile(root/'research/hw3.zip') as z:
   for name in z.namelist():
    p=PurePosixPath(name)
    if p.suffix.lower() not in ['.png','.jpg','.jpeg'] or '__MACOSX' in p.parts:continue
    if 'models' not in p.parts:continue
    path='/'.join(p.parts[p.parts.index('models'):])+'.ppm'
    im=Image.open(io.BytesIO(z.read(name))).convert('RGB');buf=io.BytesIO();im.save(buf,format='PPM')
    files.append({'path':path,'base64':base64.b64encode(buf.getvalue()).decode(),'originalPath':name})
  adaptations.append({'path':'models/','reason':'原包 PNG/JPEG 纹理仅做格式转换为 PPM，尺寸与 RGB 像素保留。'})
 if n==8:
  for suffix,path in [('CGL/include/CGL/vector2D.h','CGL/vector2D.h'),('CGL/src/vector2D.cpp','vector2D.cpp')]:
   f=next(f for f in official['files'] if f['path'].endswith(suffix))
   files.append({'path':path,'content':f['content'].replace('"vector2D.h"','"CGL/vector2D.h"'),'originalPath':f['path']})
  files.append({'path':'CGL/CGL.h','content':'#pragma once\n#include <vector>\n#include <cmath>\n#include "vector2D.h"\n'})
  files.append({'path':'web_main.cpp','content':'''// Browser entry; original desktop application remains in the source archive.
#include "rope.h"
#include <fstream>
#include <iostream>
int main(){
 CGL::Rope rope({0,1},{2,1},8,1,100,{0});
 if(rope.masses.empty()){std::cout<<"Complete Rope constructor in rope.cpp first.\\n";return 0;}
 for(int i=0;i<120;i++)rope.simulateEuler(1.0/120,CGL::Vector2D(0,-9.8));
 std::ofstream out("rope.csv");out<<"x,y\\n";
 for(auto* m:rope.masses)out<<m->position.x<<","<<m->position.y<<"\\n";
 std::cout<<"Saved final positions to rope.csv\\n";
}
'''})
  adaptations.append({'path':'web_main.cpp','reason':'用可编辑的固定时间步入口代替 GLFW 窗口；原 rope.cpp/mass.h/spring.h 算法与 TODO 保留，终态输出 CSV。'})
 files.append({'path':'web_platform.hpp','content':'// Browser compatibility includes; does not implement homework algorithms.\n#pragma once\n#include <algorithm>\n#include <array>\n#include <cstdint>\n#include <cstdio>\n#include <cstdlib>\n#include <cmath>\n#include <cstring>\n#include <limits>\n#include <iostream>\n'})
 sources=[f['path'] for f in files if f['path'].endswith('.cpp')]
 project={'id':n,'title':titles[n],'focus':focus[n],'sources':sources,'eigen':n in [0,1,2,3], 'files':files,'adaptations':adaptations,'tasks':tasks[n],'post':official['post'],'archive':official['archive'],'sha256':official['sha256'],'args':['output.png','normal'] if n==3 else []}
 (out/f'project-{n}.json').write_text(json.dumps(project,ensure_ascii=False),encoding='utf8')
 print(n,len(files),'files',sources)
manifest=[]
for n in range(9):
 d=json.loads((out/f'official-{n}.json').read_text(encoding='utf8'));manifest.append({k:v for k,v in d.items() if k!='files'})
(out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf8')
