// Keep static-hosted assets below 25 MiB, without modifying compiler bytes.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../public/compiler'),bytes=fs.readFileSync(path.join(root,'clang'));
const parts=[];
for(let i=0;i<bytes.length;i+=8*1024*1024){const name=`clang-part-${parts.length}.wasm`;fs.writeFileSync(path.join(root,name),bytes.subarray(i,i+8*1024*1024));parts.push(name);}
fs.writeFileSync(path.join(root,'clang-parts.json'),JSON.stringify({parts,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')},null,2)+'\n');
console.log(`Clang: ${parts.length} parts, ${bytes.length} original bytes`);
