import test from 'node:test';
import assert from 'node:assert/strict';
import {aliasFrequency,perspectiveAttribute,oscillator,solveIK,loopSubdivision} from '../src/analysisMath.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
test('sampling ambiguity preserves every sampled cosine value',()=>{
 near(aliasFrequency(7,10),3);
 for(let n=0;n<30;n++)near(Math.cos(2*Math.PI*7*n/10),Math.cos(2*Math.PI*3*n/10));
 near(aliasFrequency(7,16),7);near(aliasFrequency(33,10),3);
});
test('perspective interpolation preserves endpoints and equal-depth linearity',()=>{
 near(perspectiveAttribute(0,2,10,1,4),2);near(perspectiveAttribute(1,2,10,1,4),10);
 near(perspectiveAttribute(.5,0,1,1,4),.2);
 for(const t of [0,.2,.5,.9,1])near(perspectiveAttribute(t,2,10,3,3),2+8*t);
});
test('integration energy follows independently derived first-step factors',()=>{
 const h=.2;
 near(oscillator('explicit',h,1)[1][3],.5*(1+h*h));
 near(oscillator('implicit',h,1)[1][3],.5/(1+h*h));
 near(oscillator('midpoint',h,1)[1][3],.5*(1+h**4/4));
 const energy=oscillator('symplectic',.1,200).map(p=>p[3]);
 assert.ok(Math.min(...energy)>.45&&Math.max(...energy)<.56);
});
test('both IK branches hit reachable targets and unreachable targets are projected',()=>{
 for(const branch of [1,-1]){const ik=solveIK(1,1,1,1,branch);near(ik.end[0],1);near(ik.end[1],1);assert.ok(ik.reachable);}
 const far=solveIK(3,0);assert.equal(far.reachable,false);near(far.end[0],2);near(far.end[1],0);
 const origin=solveIK(0,0);assert.ok(origin.end.every(Number.isFinite));near(Math.hypot(...origin.end),0);
});
test('Loop subdivision uses old values simultaneously and preserves tetrahedron topology',()=>{
 const vertices=[[1,1,1],[-1,-1,1],[-1,1,-1],[1,-1,-1]],faces=[[0,1,2],[0,3,1],[0,2,3],[1,3,2]];
 const original=JSON.stringify(vertices),mesh=loopSubdivision(vertices,faces);
 assert.equal(JSON.stringify(vertices),original);assert.equal(mesh.faces.length,16);assert.equal(mesh.vertices.length,10);
 for(let i=0;i<4;i++)for(let j=0;j<3;j++)near(mesh.vertices[i][j],vertices[i][j]/4);
 const edges=new Set(mesh.faces.flatMap(f=>f.map((a,i)=>[a,f[(i+1)%3]].sort((a,b)=>a-b).join(':'))));
 assert.equal(mesh.vertices.length-edges.size+mesh.faces.length,2);
});
