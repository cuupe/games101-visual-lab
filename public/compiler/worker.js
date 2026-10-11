/* Browser-only C++17 runner. Third-party compiler: ./provenance.json. */
importScripts('./shared.js');
let outputSize=0;
const write=text=>{
 outputSize+=text.length;
 if(outputSize>200000)throw new Error('输出超过 200 KB，请减少循环打印。');
 postMessage({type:'output',text:text.replace(/\x1b\[[0-9;]*m/g,'')});
};
async function readBuffer(name){
 if(name==='clang'){
  const manifestResponse=await fetch(new URL('clang-parts.json',self.location.href));
  if(!manifestResponse.ok)throw new Error('Clang 分片清单加载失败');
  const manifest=await manifestResponse.json();
  const parts=await Promise.all(manifest.parts.map(readBuffer));
  const bytes=new Uint8Array(manifest.bytes);let offset=0;
  for(const part of parts){bytes.set(new Uint8Array(part),offset);offset+=part.byteLength;}
  const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');
  if(offset!==manifest.bytes||hash!==manifest.sha256)throw new Error('Clang 数据校验失败，请刷新后重试');
  return bytes.buffer;
 }
 const response=await fetch(new URL(name,self.location.href));
 if(!response.ok)throw new Error(`无法加载 ${name}：HTTP ${response.status}`);
 return response.arrayBuffer();
}
function addFiles(api,files){
 const dirs=new Set();
 for(const file of files){
  if(!/^[a-zA-Z0-9_./ -]+$/.test(file.path)||file.path.startsWith('/')||file.path.split('/').includes('..'))throw new Error(`无效工作区路径：${file.path}`);
  const parts=file.path.split('/');
  for(let i=1;i<parts.length;i++)dirs.add(parts.slice(0,i).join('/'));
 }
 for(const dir of [...dirs].sort((a,b)=>a.split('/').length-b.split('/').length))api.memfs.addDirectory(dir);
 for(const file of files)api.memfs.addFile(file.path,file.base64?Uint8Array.from(atob(file.base64),c=>c.charCodeAt(0)):new TextEncoder().encode(file.content));
}
self.onmessage=async({data})=>{
 outputSize=0;
 let phase='加载编译器';
 try{
  if(!Array.isArray(data.files)||data.files.length>600||data.files.reduce((n,f)=>n+(f.content?.length||f.base64?.length||0),0)>24000000)throw new Error('项目大小超过当前实验限制。');
  postMessage({type:'status',phase});
  const api=new API({memfs:'memfs-fixed.wasm',readBuffer,compileStreaming:async name=>WebAssembly.compile(await readBuffer(name)),hostWrite:write});
  await api.ready;
  if(data.eigen){
   const response=await fetch(new URL('./eigen.json',self.location.href));
   if(!response.ok)throw new Error('Eigen 头文件加载失败');
   addFiles(api,(await response.json()).files);
  }
  addFiles(api,data.files);
  for(const name of ['output.ppm','binary.ppm','rope.csv'])api.memfs.addFile(name,new Uint8Array());
  api.memfs.setStdinStr(data.stdin||'');
  const clang=await api.getModule('clang');
  const objects=[];
  for(const filename of data.sources){
   if(!data.files.some(f=>f.path===filename)||!filename.endsWith('.cpp'))throw new Error('编译入口必须是项目中的 .cpp 文件');
   phase=`编译 ${filename}`;postMessage({type:'status',phase});
   const object=`web-${objects.length}.o`;objects.push(object);
   await api.run(clang,'clang','-cc1','-emit-obj',...api.clangCommonArgs,'-std=c++17','-O1','-I.','-I/eigen3','-include','web_platform.hpp','-DGAMES101_WEB=1','-Wno-unused-value','-o',object,'-x','c++',filename);
  }
  phase='链接 WebAssembly';postMessage({type:'status',phase});
  const linker=await api.getModule('lld');
  await api.run(linker,'wasm-ld','--no-threads','-z','stack-size=8388608','--max-memory=536870912','-Llib/wasm32-wasi','lib/wasm32-wasi/crt1.o',...objects,'-lc','-lc++','-lc++abi','-lcanvas','-o','program.wasm');
  const program=await WebAssembly.compile(api.memfs.getFileContents('program.wasm'));
  phase='运行程序';postMessage({type:'status',phase});
  await api.run(program,'program.wasm',...(data.args||[]));
  const outputs=[];
  for(const name of ['output.ppm','binary.ppm','rope.csv']){
   try{const content=api.memfs.getFileContents(name);if(content.length&&content.length<16000000)outputs.push({name,bytes:content.slice()});}catch{}
  }
  postMessage({type:'done',outputs},outputs.map(f=>f.bytes.buffer));
 }catch(error){postMessage({type:'error',phase,message:error.message||String(error)});}
};
