// Compile adversarial programs with the actual shipped Worker. Each case runs in
// a disposable Node Worker too, so a regression cannot block the test supervisor.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const {Worker,isMainThread,parentPort,workerData}=require('node:worker_threads');
const root=path.resolve(__dirname,'../public/compiler');
if(!isMainThread){
 const context=vm.createContext({console:{log(){}},WebAssembly,TextEncoder,TextDecoder,Uint8Array,ArrayBuffer,DataView,URL,atob,performance,crypto:require('node:crypto').webcrypto,
  self:{location:{href:'https://test.local/compiler/worker.js'}},fetch:async url=>{const name=path.join(root,path.basename(new URL(url).pathname));return {ok:fs.existsSync(name),arrayBuffer:async()=>new Uint8Array(fs.readFileSync(name)).buffer,json:async()=>JSON.parse(fs.readFileSync(name,'utf8'))};},postMessage:message=>parentPort.postMessage(message)});
 context.importScripts=(...names)=>names.forEach(name=>vm.runInContext(fs.readFileSync(path.join(root,path.basename(name)),'utf8'),context));
 vm.runInContext(fs.readFileSync(path.join(root,'worker.js'),'utf8'),context);
 context.self.onmessage({data:{files:[{path:'main.cpp',content:workerData},{path:'web_platform.hpp',content:''},{path:'assets/data.txt',content:'learning'}],sources:['main.cpp']}}).catch(e=>parentPort.postMessage({type:'error',message:e.message}));
}else{
 const cases=[
  ['legitimate assets, image, CSV and compiler isolation',`#include <iostream>\n#include <fstream>\nint main(){std::ifstream asset("assets/data.txt"),compiler("lib/wasm32-wasi/libc.a"),host("/etc/passwd");std::cout<<"asset="<<bool(asset)<<" compiler="<<bool(compiler)<<" host="<<bool(host)<<"\\n";std::ofstream("output.ppm")<<"P3\\n1 1\\n255\\n1 2 3\\n";std::ofstream("rope.csv")<<"x,y\\n0,1\\n2,3\\n";}`,r=>{assert.ok(r.log.includes('asset=1 compiler=0 host=0'));assert.equal(r.done.outputs.length,2);} ],
  ['single large stdout write',`#include <cstdio>\n#include <string>\nint main(){std::string s(600000,'x');std::fwrite(s.data(),1,s.size(),stdout);}`,r=>assert.match(r.error.message,/200 KiB/)],
  ['tiny UTF-8 writes are byte-limited and batched',`#include <cstdio>\nint main(){for(int i=0;i<100000;i++){std::fputs("中",stdout);std::fflush(stdout);}}`,r=>{assert.match(r.error.message,/200 KiB/);assert.ok(r.messages<70);assert.ok(Buffer.byteLength(r.log)<210000);} ],
  ['oversized virtual file',`#include <fstream>\n#include <string>\nint main(){std::string s(1024*1024,'x');std::ofstream f("large.txt");for(int i=0;i<20;i++)f.write(s.data(),s.size());}`,r=>assert.match(r.error.message,/文件系统超过限制/)],
  ['aggregate virtual files',`#include <fstream>\n#include <string>\nint main(){std::string s(1024*1024,'x');for(int i=0;i<7;i++){std::ofstream f(std::to_string(i)+".txt");for(int j=0;j<12;j++)f.write(s.data(),s.size());}}`,r=>assert.match(r.error.message,/文件系统超过限制/)],
  ['heap growth beyond cap is denied',`#include <iostream>\n#include <cstdlib>\nint main(){void*(*volatile allocate)(size_t)=std::malloc;void* p=allocate(600u*1024u*1024u);std::cout<<"blocked="<<(p==nullptr)<<" grow="<<(__builtin_wasm_memory_grow(0,9000)==-1)<<"\\n";}`,r=>assert.ok(r.log.includes('blocked=1 grow=1'))],
  ['invalid syscall pointer',`#include <wasi/core.h>\nint main(){size_t n;return __wasi_fd_write(1,(const __wasi_ciovec_t*)0xfffffff0,1024,&n);}`,r=>assert.match(r.error.message,/指针越界/)],
  ['overlong syscall path',`#include <fstream>\n#include <string>\nint main(){std::ifstream f(std::string(5000,'x'));}`,r=>assert.match(r.error.message,/路径超过/)],
 ];
 async function check([name,source,verify]){
  const worker=new Worker(__filename,{workerData:source});let log='',messages=0;
  try{const result=await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error(`${name}: 30 second supervisor timeout`)),30000);
   worker.on('error',e=>{clearTimeout(timer);reject(e);});
   worker.on('message',message=>{if(message.type==='output'){log+=message.text;messages++;}if(['error','done'].includes(message.type)){clearTimeout(timer);resolve({log,messages,error:message.type==='error'?message:null,done:message.type==='done'?message:null});}});
  });try{verify(result);}catch(error){throw Error(`${name}: ${error.message}\n${JSON.stringify(result)}`);}console.log(`PASS: ${name}`);}finally{await worker.terminate();}
 }
 (async()=>{for(const item of cases.filter(item=>!process.argv[2]||item[0].includes(process.argv[2])))await check(item);})().catch(error=>{console.error(error);process.exitCode=1;});
}
