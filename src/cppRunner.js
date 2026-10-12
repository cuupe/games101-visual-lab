// Supervision stays on the main thread: a blocked guest cannot disable its timer.
export function startCppRun(job, callbacks, createWorker, timers={set:(fn,ms)=>setTimeout(fn,ms),clear:id=>clearTimeout(id)}) {
  const policy=globalThis.Games101Sandbox;
  policy.validateJob(job); // Reject before allocating a Worker or cloning the project.
  const worker=createWorker();let active=true,totalTimer,runTimer,receivedBytes=0;
  function finish(message) {
    if(!active)return;
    active=false;timers.clear(totalTimer);timers.clear(runTimer);worker.terminate();callbacks.finish(message);
  }
  function failure(message) {callbacks.output(`\n${message}\n`);finish(message);}
  worker.onmessage=({data})=>{
    if(!active)return;
    try {
      if(!data || typeof data!=='object')throw Error('Worker 消息无效');
      if(data.type==='output') {
        if(typeof data.text!=='string' || data.text.length>policy.limits.outputBytes)throw Error('Worker 输出无效');
        receivedBytes+=new TextEncoder().encode(data.text).length;
        if(receivedBytes>policy.limits.outputBytes)throw Error('标准输出超过 200 KiB，已终止');
        callbacks.output(data.text);
      } else if(data.type==='status') {
        if(typeof data.phase!=='string' || data.phase.length>512 || !['compile','run'].includes(data.stage))throw Error('Worker 状态无效');
        callbacks.status(data.phase);
        if(data.stage==='run' && runTimer===undefined)runTimer=timers.set(()=>failure('程序运行超过 30 秒，已终止。请减少尺寸或采样数后重试。'),policy.limits.runMs);
      } else if(data.type==='error') {
        if(typeof data.message!=='string' || data.message.length>2000)throw Error('Worker 错误消息无效');
        failure(`运行失败：${data.message}`);
      } else if(data.type==='done') {
        callbacks.results(policy.validateResults(data.outputs));finish('运行完成');
      } else throw Error('未知 Worker 消息');
    } catch(error) {failure(`安全检查失败：${error.message}`);}
  };
  worker.onerror=event=>failure(`Worker 运行失败：${event.message||'未知错误'}`);
  worker.onmessageerror=()=>failure('Worker 结果无法读取，已终止');
  totalTimer=timers.set(()=>failure('编译和运行总时间超过 120 秒，已终止。'),policy.limits.totalMs);
  try {worker.postMessage(job);} catch(error){failure(`无法启动：${error.message}`);}
  return {get active(){return active;},stop:()=>finish('已停止运行')};
}
