// GAMES101 browser adapter: only the small API subset used by assignments 1-4.
// It is not OpenCV. GUI calls emit output.ppm; textures load converted PPM assets.
#ifndef GAMES101_WEB_OPENCV_HPP
#define GAMES101_WEB_OPENCV_HPP
#include <algorithm>
#include <cmath>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>
#define CV_8UC3 0
#define CV_32FC3 1
namespace cv {
enum { COLOR_RGB2BGR, COLOR_BGR2RGB, WINDOW_AUTOSIZE, EVENT_LBUTTONDOWN };
struct Vec3b {unsigned char data[3]={0,0,0};unsigned char& operator[](int i){return data[i];} const unsigned char& operator[](int i)const{return data[i];}};
struct Scalar {double data[3];Scalar(double a=0,double b=0,double c=0):data{a,b,c}{}};
struct Point2f {float x,y;Point2f(float a=0,float b=0):x(a),y(b){} Point2f operator+(const Point2f& b)const{return {x+b.x,y+b.y};} Point2f operator-(const Point2f& b)const{return {x-b.x,y-b.y};} Point2f operator*(double s)const{return {float(x*s),float(y*s)};}};
inline Point2f operator*(double s,const Point2f& p){return p*s;}
class Mat {
 public:
 int rows=0,cols=0,type=0;std::vector<Vec3b> pixels;float* floats=nullptr;
 Mat()=default;
 Mat(int h,int w,int t,void* ptr):rows(h),cols(w),type(t),pixels(size_t(h)*w),floats(static_cast<float*>(ptr)){}
 Mat(int h,int w,int t,Scalar s=Scalar()):rows(h),cols(w),type(t),pixels(size_t(h)*w){for(auto& p:pixels)for(int i=0;i<3;i++)p[i]=(unsigned char)s.data[i];}
 template<class T>T& at(int y,int x){if(x<0||x>=cols||y<0||y>=rows){std::cerr<<"image.at: pixel outside image; check UV and raster bounds\n";std::abort();}return reinterpret_cast<T&>(pixels[size_t(y)*cols+x]);}
 void convertTo(Mat& out,int target,double scale=1)const{Mat result(rows,cols,target);for(size_t i=0;i<pixels.size();i++)for(int c=0;c<3;c++){double v=type==CV_32FC3&&floats?floats[i*3+c]:pixels[i][c];result.pixels[i][c]=(unsigned char)std::max(0.,std::min(255.,v*scale));}out=std::move(result);}
 bool empty()const{return pixels.empty();}
};
inline void cvtColor(const Mat& input,Mat& output,int){Mat result=input;for(auto& p:result.pixels)std::swap(p[0],p[2]);output=std::move(result);}
inline bool imwrite(const std::string&,const Mat& input){Mat image=input;if(image.type==CV_32FC3)input.convertTo(image,CV_8UC3);std::ofstream file("output.ppm",std::ios::binary);file<<"P6\n"<<image.cols<<" "<<image.rows<<"\n255\n";for(const auto& p:image.pixels){char bytes[3]={(char)p[2],(char)p[1],(char)p[0]};file.write(bytes,3);}std::cout<<"[web] image saved: output.ppm ("<<image.cols<<"x"<<image.rows<<")\n";return bool(file);}
inline void imshow(const std::string&,const Mat& image){imwrite("output.ppm",image);}
inline Mat imread(const std::string& name){std::ifstream file(name+".ppm",std::ios::binary);std::string format;int w,h,max;file>>format>>w>>h>>max;if(!file||format!="P6"||w<1||h<1||max!=255){std::cerr<<"Texture not found: "<<name<<".ppm\n";std::abort();}file.get();Mat image(h,w,CV_8UC3);for(auto& p:image.pixels){char rgb[3];file.read(rgb,3);p[0]=(unsigned char)rgb[2];p[1]=(unsigned char)rgb[1];p[2]=(unsigned char)rgb[0];}return image;}
inline void circle(Mat& image,Point2f center,int radius,Scalar color,int){for(int y=int(center.y)-radius;y<=int(center.y)+radius;y++)for(int x=int(center.x)-radius;x<=int(center.x)+radius;x++)if(x>=0&&x<image.cols&&y>=0&&y<image.rows&&std::hypot(x-center.x,y-center.y)<=radius){auto& p=image.at<Vec3b>(y,x);for(int c=0;c<3;c++)p[c]=(unsigned char)color.data[c];}}
inline void namedWindow(const std::string&,int){}
inline void setMouseCallback(const std::string&,void(*)(int,int,int,int,void*),void*){}
inline int waitKey(int){return 27;}
}


#endif

