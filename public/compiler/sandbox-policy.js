/* Shared policy for the editor and classic compiler Worker. No source-keyword filter. */
(function (scope) {
  'use strict';
  const MiB = 1024 * 1024;
  const limits = Object.freeze({files:96, sources:32, fileBytes:8*MiB, projectBytes:24*MiB,
    backupBytes:32*MiB, stdinBytes:64*1024, args:32, argsBytes:8192,
    outputBytes:200*1024, resultBytes:16*MiB, csvBytes:512*1024, csvPoints:20000,
    programMemory:512*MiB, compilerMemory:512*MiB, fsMemory:256*MiB,
    totalMs:120000, runMs:30000});
  const outputNames = Object.freeze(['output.ppm','binary.ppm','rope.csv']);
  const encoder = new TextEncoder();
  const record = value => value && typeof value === 'object' && !Array.isArray(value);
  function path(value) {
    if(typeof value !== 'string' || value.length > 240 || !/^[a-zA-Z0-9_./ -]+$/.test(value)) throw Error('工作区文件路径无效');
    const parts=value.split('/');
    if(parts.length>16 || parts.some(p=>!p || p==='.' || p==='..' || ['__proto__','prototype','constructor'].includes(p))) throw Error('工作区路径不能包含空段、点段或保留名称');
    if(['include','lib','eigen3'].includes(parts[0]) || outputNames.includes(value) || /^web-\d+\.o$/.test(value) || value==='program.wasm') throw Error(`路径由运行环境保留：${value}`);
    return value;
  }
  function textSize(value, max, label) {
    if(typeof value!=='string' || value.length>max) throw Error(`${label}超过限制或类型无效`);
    const size=encoder.encode(value).length;
    if(size>max)throw Error(`${label}超过限制或类型无效`);
    return size;
  }
  function files(values) {
    if(!Array.isArray(values) || !values.length || values.length>limits.files) throw Error('项目文件数量须为 1–96');
    const names=new Set(); let total=0;
    for(const file of values) {
      if(!record(file)) throw Error('项目文件无效');
      const name=path(file.path);
      if(names.has(name)) throw Error(`文件路径重复：${name}`);
      names.add(name);
      if((file.content!==undefined && typeof file.content!=='string') || (file.base64!==undefined && typeof file.base64!=='string') || (typeof file.content==='string') === (typeof file.base64==='string')) throw Error('文件必须只包含文本或 Base64 数据中的一种');
      if(typeof file.content==='string') total+=textSize(file.content,limits.fileBytes,'单个文本文件');
      else {
        const data=file.base64;
        const padding=data.endsWith('==')?2:data.endsWith('=')?1:0,body=data.slice(0,data.length-padding);
        if(data.length>Math.ceil(limits.fileBytes/3)*4 || data.length%4 || /[^A-Za-z0-9+/]/.test(body) || /[^=]/.test(data.slice(body.length))) throw Error('二进制文件超过限制或 Base64 无效');
        const size=data.length/4*3-(data.endsWith('==')?2:data.endsWith('=')?1:0);
        if(size>limits.fileBytes) throw Error('单个二进制文件超过 8 MiB');
        total+=size;
      }
      if(total>limits.projectBytes) throw Error('项目总数据超过 24 MiB');
    }
    for(const name of names) {
      const parts=name.split('/');
      for(let i=1;i<parts.length;i++) if(names.has(parts.slice(0,i).join('/'))) throw Error('文件与目录路径冲突');
    }
    return names;
  }
  function job(data) {
    if(!record(data)) throw Error('运行请求无效');
    const names=files(data.files);
    if(!Array.isArray(data.sources) || !data.sources.length || data.sources.length>limits.sources || new Set(data.sources).size!==data.sources.length) throw Error('C++ 编译入口须为 1–32 个不同文件');
    for(const name of data.sources) if(typeof name!=='string' || !name.endsWith('.cpp') || !names.has(name) || typeof data.files.find(f=>f.path===name).content!=='string') throw Error('编译入口必须是项目中的文本 .cpp 文件');
    if(data.eigen!==undefined && typeof data.eigen!=='boolean') throw Error('Eigen 选项无效');
    textSize(data.stdin??'',limits.stdinBytes,'标准输入');
    const args=data.args??[];
    if(!Array.isArray(args) || args.length>limits.args) throw Error('命令行参数不能超过 32 个');
    let size=0;
    for(const arg of args) {size+=textSize(arg,limits.argsBytes,'命令行参数'); if(arg.includes('\0')) throw Error('参数不能包含 NUL');}
    if(size>limits.argsBytes) throw Error('命令行参数总长度超过 8 KiB');
    return data;
  }
  function changes(value) {
    if(!record(value)) throw Error('工作区修改无效');
    const entries=Object.entries(value);
    if(entries.length>limits.files) throw Error('工作区文件过多');
    if(entries.length) files(entries.map(([path,content])=>({path,content})));
    return value;
  }
  function results(values) {
    if(!Array.isArray(values) || values.length>outputNames.length) throw Error('程序结果无效');
    let size=0; const seen=new Set();
    for(const file of values) {
      if(!record(file) || !outputNames.includes(file.name) || seen.has(file.name) || !(file.bytes instanceof Uint8Array)) throw Error('程序结果类型无效');
      seen.add(file.name);size+=file.bytes.byteLength;
      if(size>limits.resultBytes) throw Error('程序结果总量超过 16 MiB');
    }
    return values;
  }
  // Bound every compiler/program heap; original toolchain bytes remain intact on disk.
  function boundMemory(buffer, maximumBytes) {
    const input=new Uint8Array(buffer); let cursor=8;
    if(input.length<8 || input[0]!==0 || input[1]!==97 || input[2]!==115 || input[3]!==109) throw Error('WebAssembly 文件无效');
    const read=()=>{let value=0,shift=0,b;do{if(cursor>=input.length || shift>28)throw Error('WebAssembly 长度无效');b=input[cursor++];value+=(b&127)*2**shift;shift+=7;}while(b&128);return value;};
    const leb=value=>{const bytes=[];do{let b=value%128;value=Math.floor(value/128);bytes.push(b|(value?128:0));}while(value);return bytes;};
    while(cursor<input.length) {
      const start=cursor,id=input[cursor++],length=read(),end=cursor+length;
      if(end>input.length)throw Error('WebAssembly 节区无效');
      if(id===5) {
        if(read()!==1) throw Error('只允许一个独立 WebAssembly 内存');
        const flags=read(),minimum=read(),oldMaximum=flags===1?read():Infinity;
        if(flags>1 || cursor!==end) throw Error('不允许共享内存或 memory64');
        const maximum=Math.min(oldMaximum,maximumBytes/65536);
        if(minimum>maximum)throw Error('WebAssembly 初始内存超过限制');
        const section=new Uint8Array([1,1,...leb(minimum),...leb(maximum)]);
        const replacement=new Uint8Array([5,...leb(section.length),...section]);
        const result=new Uint8Array(start+replacement.length+input.length-end);
        result.set(input.subarray(0,start));result.set(replacement,start);result.set(input.subarray(end),start+replacement.length);
        return result;
      }
      cursor=end;
    }
    throw Error('WebAssembly 缺少独立内存');
  }
  scope.Games101Sandbox=Object.freeze({limits,outputNames,validatePath:path,validateFiles:files,validateJob:job,validateChanges:changes,validateResults:results,boundMemory});
})(globalThis);
