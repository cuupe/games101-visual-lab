import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createContext,runInContext} from 'node:vm';
import '../public/compiler/sandbox-policy.js';
import {startCppRun} from '../src/cppRunner.js';
import {parseRopeCSV} from '../src/cppFiles.js';
const policy=globalThis.Games101Sandbox;
const job=()=>({files:[{path:'main.cpp',content:'int main(){}'},{path:'web_platform.hpp',content:''}],sources:['main.cpp']});
const bytes=text=>new TextEncoder().encode(text);
test('official projects pass the same policy as imported and worker requests',()=>{
 for(let id=0;id<=8;id++)policy.validateJob(JSON.parse(readFileSync(new URL(`../public/homework/project-${id}.json`,import.meta.url))));
});
test('canonical paths, namespaces, schemas and resource limits fail closed',()=>{
 for(const path of ['../a.cpp','/a.cpp','a//b.cpp','a/./b.cpp','a\\b.cpp','lib/a.cpp','include/a.hpp','eigen3/a.hpp','web-0.o','program.wasm','output.ppm','__proto__','a/'.repeat(17)+'b.cpp'])assert.throws(()=>policy.validateFiles([{path,content:''}]));
 for(const files of [[{path:'a.cpp',content:'',base64:''}],[{path:'a',content:''},{path:'a/b',content:''}],[{path:'a',content:''},{path:'a',content:''}],[{path:'a',base64:'AA=A'}],[{path:'a',base64:'==='}]])assert.throws(()=>policy.validateFiles(files));
 for(const extra of [{sources:[]},{sources:['main.cpp','main.cpp']},{sources:['missing.cpp']},{args:['a\0b']},{args:Array(33).fill('x')},{stdin:'中'.repeat(22000)},{eigen:'true'}])assert.throws(()=>policy.validateJob({...job(),...extra}));
 assert.throws(()=>policy.validateChanges([]));assert.throws(()=>policy.validateChanges(JSON.parse('{"__proto__":"x"}')));
 assert.throws(()=>policy.validateFiles([{path:'a.txt',content:'x'.repeat(policy.limits.fileBytes+1)}]));
 assert.throws(()=>policy.validateFiles([{path:'data.bin',base64:'',content:['unexpected']} ]));
 policy.validateFiles([{path:'empty.bin',base64:''}]);
 policy.validateFiles([{path:'assets/data.bin',base64:Buffer.alloc(4*1024*1024).toString('base64')}]);
});
test('CSV rendering bounds byte count, point count and values without argument spreading',()=>{
 assert.deepEqual(parseRopeCSV(bytes('x,y\n0,1\n2,-3')).bounds,[-.5,2.5,-3.5,1.5]);
 for(const data of ['x,y\nInfinity,1','x,y\n,1','x,y\n1000001,1','z,y\n1,2','x,y\n'+'0,0\n'.repeat(20001)])assert.throws(()=>parseRopeCSV(bytes(data)));
 assert.throws(()=>parseRopeCSV(new Uint8Array(512*1024+1)));
 assert.equal(parseRopeCSV(bytes('x,y\n'+'0,0\n'.repeat(20000))).points.length,20000);
});
function fakeRun(overrides={}) {
 const scheduled=new Map(),events=[];let id=0,terminated=0;
 const worker={postMessage(){},terminate(){terminated++;},...overrides};
 const run=startCppRun(job(),{output:t=>events.push(t),status:t=>events.push(t),results:r=>events.push(r),finish:t=>events.push(t)},()=>worker,{set:(fn,ms)=>{scheduled.set(++id,{fn,ms});return id;},clear:key=>scheduled.delete(key)});
 return {worker,run,scheduled,events,get terminated(){return terminated;}};
}
test('main-thread watchdog terminates blocked guests and clears both timers',()=>{
 const state=fakeRun();state.worker.onmessage({data:{type:'status',phase:'运行程序',stage:'run'}});
 assert.deepEqual([...state.scheduled.values()].map(t=>t.ms),[120000,30000]);
 [...state.scheduled.values()].find(t=>t.ms===30000).fn();
 assert.equal(state.terminated,1);assert.equal(state.scheduled.size,0);assert.equal(state.run.active,false);
 state.worker.onmessage({data:{type:'done',outputs:[]}});assert.equal(state.terminated,1);
});
test('stop, compiler timeout, message failures and malformed results all reclaim the worker',()=>{
 for(const action of [s=>s.run.stop(),s=>[...s.scheduled.values()][0].fn(),s=>s.worker.onmessageerror(),s=>s.worker.onerror({message:'trap'}),s=>s.worker.onmessage({data:{type:'done',outputs:[{name:'secret.txt',bytes:new Uint8Array()}]}}),s=>s.worker.onmessage({data:{type:'output',text:'中'.repeat(70000)}})]){
  const state=fakeRun();action(state);assert.equal(state.terminated,1);assert.equal(state.scheduled.size,0);assert.equal(state.run.active,false);
 }
 const failed=fakeRun({postMessage(){throw Error('clone failed');}});assert.equal(failed.run.active,false);assert.equal(failed.terminated,1);
});
const str=s=>[s.length,...bytes(s)],section=(id,data)=>[id,data.length,...data];
function importedModule(name,module='wasi_unstable'){
 return new Uint8Array([0,97,115,109,1,0,0,0,...section(1,[2,96,0,1,127,96,0,0]),...section(2,[1,...str(module),...str(name),0,0]),...section(3,[1,1]),...section(5,[1,0,1]),...section(7,[2,...str('memory'),2,0,...str('_start'),0,1]),...section(10,[1,5,0,16,0,26,11])]);
}
test('runtime rejects internal memfs and canvas imports before instantiation',async()=>{
 const context=createContext({WebAssembly,TextEncoder,TextDecoder,Uint8Array,ArrayBuffer,DataView,performance,console});
 runInContext(readFileSync(new URL('../public/compiler/shared.js',import.meta.url),'utf8'),context);
 const API=runInContext('API',context);
 const api=new API({skipSysroot:true,programSandbox:true,hostWrite:()=>{},compileStreaming:async()=>WebAssembly.compile(readFileSync(new URL('../public/compiler/memfs-fixed.wasm',import.meta.url)))});
 await api.ready;
 for(const [name,module] of [['GetPathBuf','wasi_unstable'],['init','wasi_unstable'],['canvas_setWidth','env'],['fetch','env']])await assert.rejects(()=>api.run(new WebAssembly.Module(importedModule(name,module)),'test.wasm'),/不允许的程序能力/);
});
test('toolchain heaps receive a real WebAssembly memory maximum',async()=>{
 const module=new WebAssembly.Module(policy.boundMemory(importedModule('unused'),2*65536));
 const instance=new WebAssembly.Instance(module,{wasi_unstable:{unused:()=>0}});
 assert.equal(instance.exports.memory.grow(1),1);assert.throws(()=>instance.exports.memory.grow(1),RangeError);
});
test('unaligned WASI iovecs use exactly the bytes counted by the output quota',async()=>{
 const source=readFileSync(new URL('../public/compiler/shared.js',import.meta.url),'utf8');
 const context=createContext({WebAssembly,TextEncoder,TextDecoder,Uint8Array,Uint32Array,ArrayBuffer,DataView,performance,console});
 runInContext(source,context);
 runInContext(source.slice(source.indexOf('class Memory {'),source.indexOf('class MemFS {'))+';globalThis.GuestMemory=Memory;',context);
 const API=runInContext('API',context);let charged=0,decoded='';
 const api=new API({skipSysroot:true,programSandbox:true,hostWrite:text=>decoded+=text,reserveOutput:size=>charged+=size,compileStreaming:async()=>WebAssembly.compile(readFileSync(new URL('../public/compiler/memfs-fixed.wasm',import.meta.url)))});
 await api.ready;
 const memory=new WebAssembly.Memory({initial:2}),view=new DataView(memory.buffer);
 // A bounded 128 KiB fixture: rounded reads used a different vector than the validator.
 view.setUint32(64,65536,true);view.setUint32(68,65536,true);
 api.memfs.hostMem=new context.GuestMemory(memory);
 api.memfs.host_write(1,66,1,16);
 assert.equal(charged,1);assert.equal(new TextEncoder().encode(decoded).length,charged);
 assert.equal(view.getUint32(16,true),charged);
});
