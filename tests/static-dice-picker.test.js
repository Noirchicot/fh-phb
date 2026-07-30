"use strict";

/* Round 5, requirement 3: an automated guard against the picker row quietly
   growing live WebGL contexts again. It counts every canvas.getContext("webgl")
   call and every WEBGL_lose_context release, and proves that after a
   generation batch nothing survives: a fresh key after release has to open a
   brand-new canvas, not reuse an old one. */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

var glCreations = 0, canvasesCreated = 0, getContextCalls = 0, loseContextCalls = 0;

function fakeGl() {
  var attribute = 0, viewportCalls = [];
  glCreations++;
  return {
    viewportCalls,
    VERTEX_SHADER: 1, FRAGMENT_SHADER: 2, COMPILE_STATUS: 3, LINK_STATUS: 4,
    ARRAY_BUFFER: 5, STATIC_DRAW: 6, FLOAT: 7, DEPTH_TEST: 8, CULL_FACE: 9,
    COLOR_BUFFER_BIT: 16, DEPTH_BUFFER_BIT: 32, TRIANGLES: 10, LINES: 11,
    POLYGON_OFFSET_FILL: 12, LEQUAL: 13, CCW: 14, BACK: 15, BLEND: 17,
    createShader: () => ({}), shaderSource: () => {}, compileShader: () => {},
    getShaderParameter: () => true, getShaderInfoLog: () => "",
    createProgram: () => ({}), attachShader: () => {}, linkProgram: () => {},
    getProgramParameter: () => true, getProgramInfoLog: () => "",
    createBuffer: () => ({}), bindBuffer: (...args) => assert.equal(args.length, 2, "bindBuffer receives exactly target and buffer"), bufferData: () => {},
    viewport: (...args) => viewportCalls.push(args), clearColor: () => {}, clear: () => {},
    enable: () => {}, disable: () => {}, depthFunc: () => {}, depthMask: () => {},
    frontFace: () => {}, cullFace: () => {}, polygonOffset: () => {}, lineWidth: () => {},
    useProgram: () => {}, getAttribLocation: () => attribute++, enableVertexAttribArray: () => {},
    vertexAttribPointer: () => {}, getUniformLocation: () => ({}),
    uniformMatrix3fv: () => {}, uniform3fv: () => {}, drawArrays: () => {},
    getExtension: function (name) {
      if (name !== "WEBGL_lose_context") return null;
      return { loseContext: function () { loseContextCalls++; } };
    }
  };
}
function fakeCanvas() {
  canvasesCreated++;
  var gl = null;
  var id = canvasesCreated, calls = 0;
  return {
    width: 0, height: 0,
    getContext: function (type) {
      if (type !== "webgl") return null;
      getContextCalls++; calls++;
      if (!gl) gl = fakeGl();
      return gl;
    },
    toDataURL: function () { return "data:fake;canvas=" + id + ";calls=" + calls; }
  };
}
var createdCanvases = [];
var fakeDocument = { createElement: function (tag) { if (tag !== "canvas") return {}; var canvas = fakeCanvas(); createdCanvases.push(canvas); return canvas; } };

const source = fs.readFileSync(path.join(__dirname, "..", "docs", "javascripts", "fh-static-dice.js"), "utf8");
const window = { devicePixelRatio: 1, matchMedia: () => ({ matches: false }) };
const sandbox = { Float32Array, Math, Number, Set, String, console, window, document: fakeDocument, requestAnimationFrame: cb => cb(1000) };
sandbox.globalThis = sandbox;
vm.runInNewContext(source, sandbox, { filename: "fh-static-dice.js" });

assert.equal(typeof window.FHStaticDice.pickerImage, "function", "the renderer exposes a picker-image generator");
assert.equal(typeof window.FHStaticDice.releasePickerContext, "function", "the renderer exposes an explicit release for the picker generator");

assert.equal(window.FHStaticDice.pickerImage(3, "ivory", 26), null, "an unsupported shape returns no image instead of throwing");

var d6 = window.FHStaticDice.pickerImage(6, "ivory", 26);
var d20 = window.FHStaticDice.pickerImage(20, "white", 26);
var d100 = window.FHStaticDice.pickerImage(100, "white", 26);
assert.ok(d6 && d6.startsWith("data:"), "d6 picker image is generated");
assert.ok(d20 && d20.startsWith("data:"), "d20 picker image is generated");
assert.ok(d100 && d100.startsWith("data:"), "d100 picker image is generated");
assert.notEqual(d6, d20, "distinct shapes cache distinct images");

assert.equal(canvasesCreated, 1, "the whole generation batch shares one temporary canvas, not one per die");
assert.equal(glCreations, 1, "one real WebGL context serves the entire batch");
assert.ok(getContextCalls >= 3, "prepareRenderer path is exercised once per generated image");

var contextCallsBeforeCacheHit = getContextCalls;
var d6Again = window.FHStaticDice.pickerImage(6, "ivory", 26);
assert.equal(d6Again, d6, "a cached key returns the same image without regenerating");
assert.equal(getContextCalls, contextCallsBeforeCacheHit, "a cache hit never touches the WebGL context");

assert.equal(loseContextCalls, 0, "nothing is released until the caller says the generation phase is done");
assert.equal(window.FHStaticDice.releasePickerContext(), true, "releasing an active generator reports success");
assert.equal(loseContextCalls, 1, "WEBGL_lose_context.loseContext runs exactly once for the batch");
assert.equal(window.FHStaticDice.releasePickerContext(), false, "releasing again is a no-op once nothing is left to release");
assert.equal(loseContextCalls, 1, "a redundant release does not call loseContext again");

var d4 = window.FHStaticDice.pickerImage(4, "gold", 26);
assert.ok(d4, "a new key after release still generates an image");
assert.equal(canvasesCreated, 2, "no picker context survives a release -- the next batch opens a fresh temporary canvas");
window.FHStaticDice.releasePickerContext();
assert.equal(loseContextCalls, 2, "the second batch is released explicitly too");

var canvasesBeforeComposite = createdCanvases.length;
window.FHStaticDice.pickerImage(100, "azure", 26);
assert.equal(createdCanvases.length, canvasesBeforeComposite + 1, "the d100 picker opens one canvas for its composite");
var compositeCanvas = createdCanvases[createdCanvases.length - 1];
var compositeGl = compositeCanvas.getContext("webgl");
// [0] is the initial full-frame setup; [1] and [2] are the two d10 halves.
var halves = compositeGl.viewportCalls.slice(1);
assert.equal(halves.length, 2, "the d100 composite draws exactly two shapes into the one canvas, not two separate images");
assert.notEqual(halves[0][0], halves[1][0], "the two d10 halves land in different regions of the one composite canvas");
window.FHStaticDice.releasePickerContext();

console.log("Static dice picker-image tests passed.");
