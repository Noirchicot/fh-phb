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
  const draws=[],states=[],shaderSources=[];
  return {
    draws,states,shaderSources,
    VERTEX_SHADER:1,FRAGMENT_SHADER:2,COMPILE_STATUS:3,LINK_STATUS:4,
    ARRAY_BUFFER:5,STATIC_DRAW:6,FLOAT:7,DEPTH_TEST:8,CULL_FACE:9,
    COLOR_BUFFER_BIT:16,DEPTH_BUFFER_BIT:32,TRIANGLES:10,LINES:11,
    POLYGON_OFFSET_FILL:12,LEQUAL:13,CCW:14,BACK:15,BLEND:17,
    createShader:()=>({}),shaderSource:(_shader,source)=>shaderSources.push(source),compileShader:()=>{},
    getShaderParameter:()=>true,getShaderInfoLog:()=>"",
    createProgram:()=>({}),attachShader:()=>{},linkProgram:()=>{},
    getProgramParameter:()=>true,getProgramInfoLog:()=>"",
    createBuffer:()=>({}),bindBuffer:(...args)=>assert.equal(args.length,2,"bindBuffer receives exactly target and buffer"),bufferData:()=>{},
    viewport:()=>{},clearColor:()=>{},enable:value=>states.push(["enable",value]),
    disable:value=>states.push(["disable",value]),depthFunc:value=>states.push(["depthFunc",value]),
    depthMask:value=>states.push(["depthMask",value]),frontFace:value=>states.push(["frontFace",value]),
    cullFace:value=>states.push(["cullFace",value]),polygonOffset:()=>{},
    lineWidth:()=>{},clear:()=>{},useProgram:()=>{},
    getAttribLocation:()=>attribute++,enableVertexAttribArray:()=>{},
    vertexAttribPointer:()=>{},getUniformLocation:()=>({}),
    uniformMatrix3fv:()=>{},uniform3fv:()=>{},
    drawArrays:(mode,first,count)=>draws.push({mode,first,count})
  };
}
function visualPart() {
  const gl=fakeGl(),number={style:{},textContent:""};
  const canvas={width:0,height:0,isConnected:true,getBoundingClientRect:()=>({width:52}),getContext:type=>type==="webgl"?gl:null};
  return {gl,number,canvas,querySelector:selector=>selector==="canvas"?canvas:number};
}
function dieHost(sides,index,material,result=sides,pending=false) {
  const parts=sides===100?[visualPart(),visualPart()]:[visualPart()];
  const classes=classList();
  const host={
    dataset:{sides:String(sides),result:String(result),material,index:String(index),animate:"0",pending:pending?"1":"0"},
    classList:classes,
    querySelector:selector=>sides===100?null:parts[0].querySelector(selector),
    querySelectorAll:selector=>selector===".fh-cd-static3d-part"&&sides===100?parts:[],
    setAttribute:(name,value)=>{if(name==="data-mounted")host.dataset.mounted=value;}
  };
  return {host,parts,classes};
}

const dice=[4,6,8,10,12,20,100].map((sides,index)=>dieHost(sides,index,index===6?"violet":"ivory",sides===100?100:sides));
const pendingDie=dieHost(4,7,"azure",1,true);
const root={querySelectorAll:()=>dice.concat(pendingDie).map(item=>item.host)};
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
dice.forEach(({host,parts,classes},index)=>{
  assert.equal(host.dataset.mounted,"1",`d${host.dataset.sides} is mounted only once`);
  assert.ok(classes.contains("is-webgl"),`d${host.dataset.sides} builds a WebGL mesh`);
  assert.ok(classes.contains("is-settled"),`d${host.dataset.sides} reaches the supplied final face`);
  // A d100 half is deliberately smaller than a single die -- 78% of the slot's
  // width, matching the .fh-cd-static3d-part CSS ratio -- because two of them
  // sit side by side in the same footprint. This mock's host carries no
  // .style, so hostSizePx falls back to the same 52px every die case uses;
  // Math.round(52*.78)=41 is the real, intended sizing, not a regression.
  const expectedWidth=Number(host.dataset.sides)===100?41:52;
  assert.equal(parts[0].canvas.width,expectedWidth,index===0?"the canvas follows the die's rendered size":undefined);
});
const expectedMeshVertices={4:12,6:2304,8:24,10:60,12:108,20:60,100:60};
dice.forEach(({host,parts})=>{
  parts.forEach(part=>{
    const mesh=part.gl.draws.find(draw=>draw.mode===part.gl.TRIANGLES);
    assert.equal(mesh.count,expectedMeshVertices[host.dataset.sides],`d${host.dataset.sides} has the complete intended mesh`);
    assert.ok(part.gl.states.some(state=>state[0]==="depthFunc"&&state[1]===part.gl.LEQUAL),`d${host.dataset.sides} uses a coherent depth function`);
    assert.ok(part.gl.states.filter(state=>state[0]==="depthMask"&&state[1]===true).length>=3,`d${host.dataset.sides} writes depth for setup, mesh, and edge passes`);
    assert.ok(part.gl.states.some(state=>state[0]==="frontFace"&&state[1]===part.gl.CCW),`d${host.dataset.sides} keeps outward CCW winding`);
    assert.ok(part.gl.states.some(state=>state[0]==="cullFace"&&state[1]===part.gl.BACK),`d${host.dataset.sides} culls back faces`);
    assert.ok(part.gl.states.filter(state=>state[0]==="disable"&&state[1]===part.gl.BLEND).length>=3,`d${host.dataset.sides} keeps both material passes opaque`);
    assert.ok(part.gl.shaderSources.filter(source=>source.includes("gl_FragColor")).every(source=>source.includes(",1.0)")),`d${host.dataset.sides} uses opaque alpha in both fragment shaders`);
    assert.ok(part.gl.shaderSources.filter(source=>source.includes("gl_Position")).every(source=>source.includes("-p.z*.22")),`d${host.dataset.sides} maps camera-facing +Z toward the depth buffer`);
  });
});
assert.equal(dice[3].parts[0].number.textContent,"0","a natural d10 result of 10 is printed as 0");
assert.deepEqual(dice[6].parts.map(part=>part.number.textContent),["0","0"],"d100 result 100 is a pair of d10s reading 00");
assert.equal(dice[6].parts[0].number.style.color,"#f5edff","both percentile dice use the selected violet material");
assert.ok(pendingDie.classes.contains("is-webgl"),"the ready pose uses the same opaque 3D geometry");
assert.equal(pendingDie.parts[0].number.textContent,"","the ready pose does not invent a result");

const css=fs.readFileSync(path.join(__dirname,"..","docs","stylesheets","companion-dock.css"),"utf8");
const lab=fs.readFileSync(path.join(__dirname,"..","docs","static-dice-lab.html"),"utf8");
assert.match(css,/\.fh-cd-static3d-result\{[^}]*top:49%[^}]*font-size:calc\(var\(--fh-static-die-size\) \* \.28\)/,"d8 keeps the visually approved result placement and scale");
assert.match(css,/data-sides="4"[^}]*top:51%/,"d4 keeps the visually approved result placement");
[
  [6,"53","27"],[10,"62","24"],[12,"53","24"],[20,"53","21"],[100,"62","19"]
].forEach(([sides,top,scale])=>{
  var expected=new RegExp('data-sides="'+sides+'"[^}]*top:'+top+'%[^}]*font-size:calc\\(var\\(--fh-static-die-size\\) \\* \\.'+scale+'\\)');
  assert.match(css,expected,`d${sides} uses its face-calibrated result placement and scale`);
  assert.match(lab,expected,`the lab mirrors d${sides}'s face-calibrated result placement and scale`);
});

console.log("Static 3D dice tests passed.");
