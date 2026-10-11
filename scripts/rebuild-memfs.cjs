// Rebuild our bounded-read fix using the vendored WebAssembly compiler itself.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../public/compiler');
const context=vm.createContext({console,WebAssembly,TextEncoder,TextDecoder,Uint8Array,ArrayBuffer,DataView,performance,crypto:require('node:crypto').webcrypto});
vm.runInContext(fs.readFileSync(path.join(root,'shared.js'),'utf8'),context);
const CompilerAPI=vm.runInContext('API',context);
const readBuffer=async name=>new Uint8Array(fs.readFileSync(path.join(root,name))).buffer;
(async()=>{
 const api=new CompilerAPI({readBuffer,compileStreaming:async name=>WebAssembly.compile(await readBuffer(name)),hostWrite:text=>process.stdout.write(text)});
 await api.ready;
 for(const name of ['memfs.c','stb_sprintf.h'])api.memfs.addFile(name,new TextEncoder().encode(fs.readFileSync(path.join(__dirname,'memfs',name),'utf8')));
 const clang=await api.getModule('clang');
 for(const name of ['memfs.c','stb_sprintf.h'])await api.run(clang,'clang','-cc1','-emit-obj',...api.clangCommonArgs,'-O2',...(name.endsWith('.h')?['-DSTB_SPRINTF_IMPLEMENTATION']:[]),'-o',name+'.o','-x','c',name);
 const lld=await api.getModule('lld');
 await api.run(lld,'wasm-ld','--no-threads','--no-entry','--export-dynamic','--allow-undefined','-Llib/wasm32-wasi','memfs.c.o','stb_sprintf.h.o','-lc','-o','memfs-fixed.wasm');
 fs.writeFileSync(path.join(root,'memfs-fixed.wasm'),api.memfs.getFileContents('memfs-fixed.wasm'));
 console.log('Built memfs-fixed.wasm');
})().catch(error=>{console.error(error);process.exitCode=1;});
