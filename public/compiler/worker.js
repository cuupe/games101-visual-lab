/* Browser-only C++17 runner. Third-party compiler: ./provenance.json. */
importScripts('./sandbox-policy.js','./shared.js');
const policy=Games101Sandbox;
let outputSize=0,buffer='',started=false;
const flush=()=>{if(buffer){postMessage({type:'output',text:buffer});buffer='';}};
const reserveOutput=bytes=>{outputSize+=bytes;if(outputSize>policy.limits.outputBytes)throw new Error('标准输出超过 200 KiB，已终止。请减少循环打印。');};
const write=(text,reserved=false)=>{
 if(!reserved)reserveOutput(new TextEncoder().encode(text).length);
 buffer+=text.replace(/\x1b\[[0-9;]*m/g,'');
 if(buffer.length>=4096)flush();
};
const status=(phase,stage)=>{flush();postMessage({type:'status',phase,stage});};
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
 if(!['lld','sysroot.tar','memfs-fixed.wasm','clang-part-0.wasm','clang-part-1.wasm','clang-part-2.wasm','clang-part-3.wasm'].includes(name))throw new Error('不允许加载此编译器资源');
 const response=await fetch(new URL(name,self.location.href));
 if(!response.ok)throw new Error(`无法加载 ${name}：HTTP ${response.status}`);
 return response.arrayBuffer();
}
function addFiles(api,files){
 const dirs=new Set();
 for(const file of files){
  const parts=file.path.split('/');
  for(let i=1;i<parts.length;i++)dirs.add(parts.slice(0,i).join('/'));
 }
 for(const dir of [...dirs].sort((a,b)=>a.split('/').length-b.split('/').length))api.memfs.addDirectory(dir);
 for(const file of files)api.memfs.addFile(file.path,typeof file.base64==='string'?Uint8Array.from(atob(file.base64),c=>c.charCodeAt(0)):new TextEncoder().encode(file.content));
}
self.onmessage=async({data})=>{
 if(started){postMessage({type:'error',phase:'安全检查',message:'每个 Worker 只接受一次运行'});return;}
 started=true;
 outputSize=0;
 let phase='安全检查';
 try{
  policy.validateJob(data);
  phase='加载编译器';status(phase,'compile');
  const compileStreaming=async name=>WebAssembly.compile(policy.boundMemory(await readBuffer(name),name==='memfs-fixed.wasm'?policy.limits.fsMemory:policy.limits.compilerMemory));
  const options={memfs:'memfs-fixed.wasm',readBuffer,compileStreaming,hostWrite:write,reserveOutput};
  const api=new API(options);
  await api.ready;
  if(data.eigen){
   const response=await fetch(new URL('./eigen.json',self.location.href));
   if(!response.ok)throw new Error('Eigen 头文件加载失败');
   addFiles(api,(await response.json()).files);
  }
  addFiles(api,data.files);
  const clang=await api.getModule('clang');
  const objects=[];
  for(const filename of data.sources){
   if(!data.files.some(f=>f.path===filename)||!filename.endsWith('.cpp'))throw new Error('编译入口必须是项目中的 .cpp 文件');
   phase=`编译 ${filename}`;status(phase,'compile');
   const object=`web-${objects.length}.o`;objects.push(object);
   await api.run(clang,'clang','-cc1','-emit-obj',...api.clangCommonArgs,'-std=c++17','-O1','-I.','-I/eigen3','-include','web_platform.hpp','-DGAMES101_WEB=1','-Wno-unused-value','-o',object,'-x','c++',filename);
  }
  phase='链接 WebAssembly';status(phase,'compile');
  const linker=await api.getModule('lld');
  await api.run(linker,'wasm-ld','--no-threads','-z','stack-size=8388608','--max-memory=536870912','-Llib/wasm32-wasi','lib/wasm32-wasi/crt1.o',...objects,'-lc','-lc++','-lc++abi','-lcanvas','-o','program.wasm');
  const program=await WebAssembly.compile(policy.boundMemory(api.memfs.getFileContents('program.wasm'),policy.limits.programMemory));
  // The guest never inherits compiler headers, libraries, objects or toolchain memory.
  const runtime=new API({...options,skipSysroot:true,programSandbox:true});
  await runtime.ready;addFiles(runtime,data.files);
  for(const name of policy.outputNames)runtime.memfs.addFile(name,new Uint8Array());
  runtime.memfs.setStdinStr(data.stdin||'');
  phase='运行程序';status(phase,'run');
  await runtime.run(program,'program.wasm',...(data.args||[]));
  const outputs=[];
  let resultSize=0;
  for(const name of policy.outputNames){
   const content=runtime.memfs.getFileContents(name);
   if(content.length){resultSize+=content.length;if(resultSize>policy.limits.resultBytes)throw new Error('程序结果总量超过 16 MiB');outputs.push({name,bytes:content.slice()});}
  }
  flush();
  postMessage({type:'done',outputs},outputs.map(f=>f.bytes.buffer));
 }catch(error){flush();postMessage({type:'error',phase,message:String(error.message||error).slice(0,2000)});}
};
