export function parsePPM(bytes){
 if(!(bytes instanceof Uint8Array)||bytes.byteLength>16*1024*1024)throw Error('图像文件超过 16 MiB 或类型无效');
 let cursor=0;
 const white=c=>c===9||c===10||c===13||c===32;
 function token(){while(cursor<bytes.length){if(white(bytes[cursor]))cursor++;else if(bytes[cursor]===35){while(cursor<bytes.length&&bytes[cursor]!==10)cursor++;}else break;}const start=cursor;while(cursor<bytes.length&&!white(bytes[cursor]))cursor++;return new TextDecoder().decode(bytes.subarray(start,cursor));}
 const type=token(),width=Number(token()),height=Number(token()),max=Number(token());
 if(!['P6','P3'].includes(type)||!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width*height>4e6||max!==255)throw Error('仅支持尺寸不超过 400 万像素、最大值 255 的 P3/P6 PPM。');
 const rgba=new Uint8ClampedArray(width*height*4);
 if(type==='P6'){
  // Exactly one header separator (or CRLF), never skip binary pixel whitespace.
  if(bytes[cursor]===13&&bytes[cursor+1]===10)cursor+=2;else if(white(bytes[cursor]))cursor++;else throw Error('PPM 头缺少分隔符');
  if(bytes.length-cursor<width*height*3)throw Error('PPM 像素数据不完整');
  for(let i=0;i<width*height;i++){rgba.set(bytes.subarray(cursor+i*3,cursor+i*3+3),i*4);rgba[i*4+3]=255;}
 }else for(let i=0;i<width*height;i++){for(let c=0;c<3;c++){const value=token();if(value===''||!Number.isFinite(Number(value)))throw Error('PPM 像素数据不完整');rgba[i*4+c]=Number(value);}rgba[i*4+3]=255;}
 return {width,height,rgba};
}
export function parseRopeCSV(bytes){
 if(!(bytes instanceof Uint8Array)||bytes.byteLength>512*1024)throw Error('CSV 预览不能超过 512 KiB');
 const rows=new TextDecoder('utf-8',{fatal:true}).decode(bytes).trim().split(/\r?\n/);
 if(rows.shift()!=='x,y'||rows.length>20000)throw Error('CSV 需要 x,y 表头，最多预览 20000 个点');
 const points=[];let xmin=Infinity,xmax=-Infinity,ymin=Infinity,ymax=-Infinity;
 for(const row of rows){
  if(row.length>128)throw Error('CSV 行过长');
  const parts=row.split(',');
  if(parts.length!==2||parts.some(s=>!s.trim()))throw Error('CSV 坐标格式无效');
  const [x,y]=parts.map(Number);
  if(!Number.isFinite(x)||!Number.isFinite(y)||Math.abs(x)>1e6||Math.abs(y)>1e6)throw Error('CSV 坐标必须有限且绝对值不超过 1000000');
  points.push([x,y]);xmin=Math.min(xmin,x);xmax=Math.max(xmax,x);ymin=Math.min(ymin,y);ymax=Math.max(ymax,y);
 }
 return {points,bounds:points.length?[xmin-.5,xmax+.5,ymin-.5,ymax+.5]:[-1,1,-1,1]};
}
function database(){return new Promise((resolve,reject)=>{const req=indexedDB.open('games101-cpp-v1',1);req.onupgradeneeded=()=>req.result.createObjectStore('projects');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
export async function readCppChanges(id){const db=await database();try{return await new Promise((resolve,reject)=>{const req=db.transaction('projects').objectStore('projects').get(String(id));req.onsuccess=()=>resolve(req.result||{});req.onerror=()=>reject(req.error);});}finally{db.close();}}
export async function saveCppChanges(id,changes){const db=await database();try{await new Promise((resolve,reject)=>{const tx=db.transaction('projects','readwrite');tx.objectStore('projects').put(changes,String(id));tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}finally{db.close();}}
export function downloadFile(name,data,type='application/octet-stream'){const url=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
