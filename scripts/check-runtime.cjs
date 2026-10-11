const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../public/compiler');let log='',error,done=false;
const context=vm.createContext({console,WebAssembly,TextEncoder,TextDecoder,Uint8Array,ArrayBuffer,DataView,URL,atob,performance,crypto:require('node:crypto').webcrypto,
 self:{location:{href:'https://test.local/compiler/worker.js'}},
 fetch:async url=>{const file=path.join(root,path.basename(new URL(url).pathname));return {ok:fs.existsSync(file),arrayBuffer:async()=>new Uint8Array(fs.readFileSync(file)).buffer,json:async()=>JSON.parse(fs.readFileSync(file,'utf8'))};},
 postMessage:m=>{if(m.type==='output')log+=m.text;if(m.type==='error')error=m;if(m.type==='done')done=true;}
});
context.importScripts=()=>vm.runInContext(fs.readFileSync(path.join(root,'shared.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'worker.js'),'utf8'),context);
const source=`#include <iostream>
#include <fstream>
#include <string>
#include <ctime>
int main(){
 std::string name;std::getline(std::cin,name);std::cout<<"中文："<<name<<"\\n";
 std::ifstream in("data.txt",std::ios::binary);char buf[7];int size=0;
 while(in.read(buf,7)||in.gcount())size+=in.gcount();
 std::cout<<"read="<<size<<" eof="<<in.eof()<<"\\n";
 in.clear();in.seekg(20000);in.read(buf,7);std::cout<<"beyond="<<in.gcount()<<"\\n";
 std::cout<<"clock="<<(std::time(nullptr)>0)<<"\\n";
}`;
(async()=>{
 await context.self.onmessage({data:{files:[{path:'main.cpp',content:source},{path:'web_platform.hpp',content:''},{path:'data.txt',content:'abcdefg'.repeat(2001)+'xyz'}],sources:['main.cpp'],stdin:'图形学\n'}});
 assert.equal(error,undefined,JSON.stringify(error));assert.ok(done);
 for(const output of ['中文：图形学','read=14010 eof=1','beyond=0','clock=1'])assert.ok(log.includes(output),log);
 console.log('PASS: real C++ UTF-8 I/O, short-buffer reads, EOF, seek beyond EOF and WASI clocks');
})().catch(e=>{console.error(e);process.exitCode=1;});
