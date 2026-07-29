"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function classList() {
  const values=new Set();
  return {add:value=>values.add(value),contains:value=>values.has(value)};
}
function fakeGl() {
  let attribute=0;
  const draws=[];
  return {
    draws,
    VERTEX_SHADER:1,FRAGMENT_SHADER:2,COMPILE_STATUS:3,LINK_STATUS:4,
    ARRAY_BUFFER:5,STATIC_DRAW:6,FLOAT:7,DEPTH_TEST:8,CULL_FACE:9,
    COLOR_BUFFER_BIT:16,DEPTH_BUFFER_BIT:32,TRIANGLES:10,LINES:11,
    POLYGON_OFFSET_FILL:12,
    createShader:()=>({}),shaderSource:()=>{},compileShader:()=>{},
    getShaderParameter:()=>true,getShaderInfoLog:()=>"",
    createProgram:()=>({}),attachShader:()=>{},linkProgram:()=>{},
    getProgramParameter:()=>true,getProgramInfoLog:()=>"",
    createBuffer:()=>({}),bindBuffer:()=>{},bufferData:()=>{},
    viewport:()=>{},clearColor:()=>{},enable:()=>{},polygonOffset:()=>{},
    lineWidth:()=>{},clear:()=>{},useProgram:()=>{},
    getAttribLocation:()=>attribute++,enableVertexAttribArray:()=>{},
    vertexAttribPointer:()=>{},getUniformLocation:()=>({}),
    uniformMatrix3fv:()=>{},uniform3fv:()=>{},
    drawArrays:(mode,first,count)=>draws.push({mode,first,count})
  };
}
function dieHost(sides,index,material) {
  const gl=fakeGl();
  const canvas={
    width:0,height:0,isConnected:true,
    getBoundingClientRect:()=>({width:52}),
    getContext:type=>type==="webgl"?gl:null
  };
  const number={style:{}};
  const classes=classList();
  const host={
    dataset:{sides:String(sides),result:String(sides),material,index:String(index),animate:"0"},
    classList:classes,
    querySelector:selector=>selector==="canvas"?canvas:number,
    setAttribute:(name,value)=>{if(name==="data-mounted")host.dataset.mounted=value;}
  };
  return {host,canvas,number,classes,gl};
}

const dice=[4,6,8,10,12,20,100].map((sides,index)=>dieHost(sides,index,index===6?"violet":"ivory"));
const root={querySelectorAll:()=>dice.map(item=>item.host)};
const window={devicePixelRatio:1,matchMedia:()=>({matches:false})};
const sandbox={
  Float32Array,Math,Number,Set,String,console,window,
  requestAnimationFrame:callback=>callback(1000)
};
sandbox.globalThis=sandbox;

const source=fs.readFileSync(path.join(__dirname,"..","docs","javascripts","fh-static-dice.js"),"utf8");
vm.runInNewContext(source,sandbox,{filename:"fh-static-dice.js"});

assert.equal(typeof window.FHStaticDice.mount,"function","the renderer exposes one progressive-enhancement mount");
assert.deepEqual(Array.from(window.FHStaticDice.supportedSides),[4,6,8,10,12,20,100],"the complete tabletop dice set is supported");
assert.ok(window.FHStaticDice.materials.includes("crimson"),"player colours are exposed to every die shape");
window.FHStaticDice.mount(root);
dice.forEach(({host,canvas,classes},index)=>{
  assert.equal(host.dataset.mounted,"1",`d${host.dataset.sides} is mounted only once`);
  assert.ok(classes.contains("is-webgl"),`d${host.dataset.sides} builds a WebGL mesh`);
  assert.ok(classes.contains("is-settled"),`d${host.dataset.sides} reaches the supplied final face`);
  assert.equal(canvas.width,52,index===0?"the canvas follows the die's rendered size":undefined);
});
const expectedMeshVertices={4:12,6:2304,8:24,10:60,12:108,20:60,100:60};
dice.forEach(({host,gl})=>{
  const mesh=gl.draws.find(draw=>draw.mode===gl.TRIANGLES);
  assert.equal(mesh.count,expectedMeshVertices[host.dataset.sides],`d${host.dataset.sides} has the complete intended mesh`);
});
assert.equal(dice[6].number.style.color,"#f5edff","d100 uses the selected violet material");

console.log("Static 3D dice tests passed.");
