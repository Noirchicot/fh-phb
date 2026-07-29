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
  return {
    VERTEX_SHADER:1,FRAGMENT_SHADER:2,COMPILE_STATUS:3,LINK_STATUS:4,
    ARRAY_BUFFER:5,STATIC_DRAW:6,FLOAT:7,DEPTH_TEST:8,CULL_FACE:9,
    COLOR_BUFFER_BIT:16,DEPTH_BUFFER_BIT:32,TRIANGLES:10,LINES:11,
    createShader:()=>({}),shaderSource:()=>{},compileShader:()=>{},
    getShaderParameter:()=>true,getShaderInfoLog:()=>"",
    createProgram:()=>({}),attachShader:()=>{},linkProgram:()=>{},
    getProgramParameter:()=>true,getProgramInfoLog:()=>"",
    createBuffer:()=>({}),bindBuffer:()=>{},bufferData:()=>{},
    viewport:()=>{},clearColor:()=>{},enable:()=>{},clear:()=>{},
    useProgram:()=>{},getAttribLocation:()=>attribute++,
    enableVertexAttribArray:()=>{},vertexAttribPointer:()=>{},
    getUniformLocation:()=>({}),uniformMatrix3fv:()=>{},uniform3fv:()=>{},
    drawArrays:()=>{}
  };
}

const canvas={
  width:0,height:0,isConnected:true,
  getBoundingClientRect:()=>({width:52}),
  getContext:type=>type==="webgl"?fakeGl():null
};
const number={style:{}};
const classes=classList();
const host={
  dataset:{sides:"20",result:"13",material:"ivory",index:"0",animate:"1"},
  classList:classes,
  querySelector:selector=>selector==="canvas"?canvas:number,
  setAttribute:(name,value)=>{if(name==="data-mounted")host.dataset.mounted=value;}
};
const root={querySelectorAll:()=>[host]};
let frame=0;
const window={
  devicePixelRatio:1,
  matchMedia:()=>({matches:false})
};
const sandbox={
  Float32Array,Math,Number,Set,String,console,window,
  requestAnimationFrame:callback=>{frame+=1;callback(frame===1?1000:2200);}
};
sandbox.globalThis=sandbox;

const source=fs.readFileSync(path.join(__dirname,"..","docs","javascripts","fh-static-dice.js"),"utf8");
vm.runInNewContext(source,sandbox,{filename:"fh-static-dice.js"});

assert.equal(typeof window.FHStaticDice.mount,"function","the renderer exposes one progressive-enhancement mount");
window.FHStaticDice.mount(root);
assert.equal(host.dataset.mounted,"1","a die is mounted only once");
assert.ok(classes.contains("is-webgl"),"the WebGL renderer replaces the SVG fallback when a context exists");
assert.ok(classes.contains("is-settled"),"the die reaches the supplied final face");
assert.equal(canvas.width,52,"the canvas follows the die's rendered size");
assert.match(number.style.color,/^#/,"the face number uses the selected material");

console.log("Static 3D dice tests passed.");
