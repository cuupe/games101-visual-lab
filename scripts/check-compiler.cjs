const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'../public/compiler');
vm.runInThisContext(fs.readFileSync(path.join(root,'shared.js'),'utf8'));
const Api=vm.runInThisContext('API');
const readBuffer=async name=>new Uint8Array(fs.readFileSync(path.join(root,name))).buffer;
(async()=>{
 const api=new Api({readBuffer,compileStreaming:async name=>WebAssembly.compile(await readBuffer(name)),hostWrite:s=>process.stdout.write(s)});
 await api.compileLinkRun('#include <iostream>\nint main(){std::cout << "C++ WASM result: " << 6*7 << "\\n";}');
})().catch(e=>{console.error(e);process.exitCode=1});
