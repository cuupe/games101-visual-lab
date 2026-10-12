const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'../public');fs.mkdirSync(path.resolve(__dirname,'../qa'),{recursive:true});
async function check(id){
 let log='',error,outputs=[];const started=Date.now();
 const context=vm.createContext({console,WebAssembly,TextEncoder,TextDecoder,Uint8Array,ArrayBuffer,DataView,URL,atob,performance,crypto:require('node:crypto').webcrypto,
  self:{location:{href:'https://test.local/compiler/worker.js'}},
  fetch:async url=>{const name=path.join(root,new URL(url,'https://test.local/compiler/').pathname);return {ok:fs.existsSync(name),arrayBuffer:async()=>new Uint8Array(fs.readFileSync(name)).buffer,json:async()=>JSON.parse(fs.readFileSync(name,'utf8'))};},
  postMessage:message=>{if(message.type==='output')log+=message.text;if(message.type==='error')error=message;if(message.type==='done')outputs=message.outputs;},
 });
 context.importScripts=(...names)=>names.forEach(name=>vm.runInContext(fs.readFileSync(path.join(root,'compiler',path.basename(name)),'utf8'),context));
 vm.runInContext(fs.readFileSync(path.join(root,'compiler/worker.js'),'utf8'),context);
 const project=JSON.parse(fs.readFileSync(path.join(root,`homework/project-${id}.json`),'utf8'));
 await context.self.onmessage({data:project});
 fs.writeFileSync(path.resolve(__dirname,`../qa/compiler-${id}.log`),log+(error?JSON.stringify(error):''));
 for(const output of outputs)fs.writeFileSync(path.resolve(__dirname,`../qa/homework-${id}-${output.name}`),output.bytes);
 console.log(JSON.stringify({id,seconds:(Date.now()-started)/1000,error,outputs:outputs.map(o=>({name:o.name,size:o.bytes.length})),tail:error?log.slice(-2300):log.slice(-160)}));
 return !error;
}
(async()=>{let ok=true;for(const id of (process.argv.slice(2).length?process.argv.slice(2):[0,1,2,3,4,5,6,7,8]))ok=(await check(id))&&ok;process.exitCode=ok?0:1;})().catch(e=>{console.error(e);process.exitCode=1;});
