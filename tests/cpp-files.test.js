import test from 'node:test';
import assert from 'node:assert/strict';
import {parsePPM} from '../src/cppFiles.js';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const bytes=text=>new TextEncoder().encode(text);
test('binary PPM preserves pixel values that look like header whitespace',()=>{
 const header=bytes('P6\r\n# source comment\r\n2 1\r\n255\r\n');
 const data=new Uint8Array([...header,10,13,32,255,0,128]);
 assert.deepEqual([...parsePPM(data).rgba],[10,13,32,255,255,0,128,255]);
});
test('PPM rejects truncated pixels and excessive allocation',()=>{
 assert.throws(()=>parsePPM(bytes('P6\n2 1\n255\nabc')));
 assert.throws(()=>parsePPM(bytes('P3\n2001 2000\n255\n')));
 const image=parsePPM(bytes('P3\n1 1\n255\n1 2 3'));
 assert.deepEqual([...image.rgba],[1,2,3,255]);
});
test('hosted compiler parts reconstruct the verified upstream bytes',()=>{
 const root=new URL('../public/compiler/',import.meta.url);
 const manifest=JSON.parse(readFileSync(new URL('clang-parts.json',root)));
 const parts=manifest.parts.map(name=>readFileSync(new URL(name,root)));
 assert.ok(parts.every(x=>x.length<=8*1024*1024));
 const compiler=Buffer.concat(parts);
 assert.equal(compiler.length,manifest.bytes);
 assert.equal(createHash('sha256').update(compiler).digest('hex'),manifest.sha256);
 assert.deepEqual(compiler,readFileSync(new URL('clang',root)));
});
test('all official homework packages retain distinct originals and runnable entry files',()=>{
 for(let id=0;id<=8;id++){
  const root=new URL('../public/homework/',import.meta.url);
  const original=JSON.parse(readFileSync(new URL(`official-${id}.json`,root)));
  const project=JSON.parse(readFileSync(new URL(`project-${id}.json`,root)));
  assert.equal(project.id,id);assert.ok(original.files.length&&project.files.length);
  assert.ok(project.sources.every(name=>project.files.some(f=>f.path===name)));
  assert.equal(new Set(project.files.map(f=>f.path)).size,project.files.length);
  assert.equal(project.sha256,original.sha256);
 }
});
