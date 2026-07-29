/* Fate's Hand — static 3D dice renderer.
   The roller owns randomness. This module only animates a result that FHPC has
   already resolved, and never moves the die away from its tray position. */
(function () {
  "use strict";

  var MATERIALS = {
    ivory:{fill:"#f3ead6",dark:"#d5c9a9",rim:"#8a6a2a",num:"#58180d"},
    gold:{fill:"#d9b25e",dark:"#a87f26",rim:"#6d4a10",num:"#3a2606"},
    green:{fill:"#3d7d56",dark:"#1f4a30",rim:"#143020",num:"#f2ead2"},
    crit:{fill:"#f0c550",dark:"#c68c22",rim:"#6d4a10",num:"#3a2606"},
    fumble:{fill:"#b51d25",dark:"#6c1015",rim:"#4a0c10",num:"#fff0ee"},
    chaos:{fill:"#8f1118",dark:"#3f0407",rim:"#ff5f67",num:"#fff0ee"},
    crimson:{fill:"#93303a",dark:"#5b1620",rim:"#4a1018",num:"#ffeceb"},
    azure:{fill:"#2f5f86",dark:"#173b57",rim:"#12293c",num:"#eef6fd"},
    violet:{fill:"#5c3d7e",dark:"#372049",rim:"#241432",num:"#f5edff"},
    slate:{fill:"#4a4f55",dark:"#2b2f34",rim:"#1c1f22",num:"#f0f2f4"},
    white:{fill:"#fbf8f1",dark:"#e3dccb",rim:"#9c8a5f",num:"#5a4a2a"}
  };
  var geometryCache = {};

  function hexRgb(hex) {
    var value=parseInt(String(hex||"#ffffff").replace("#",""),16);
    return [((value>>16)&255)/255,((value>>8)&255)/255,(value&255)/255];
  }
  function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
  function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
  function normalize(v){var length=Math.sqrt(dot(v,v))||1;return [v[0]/length,v[1]/length,v[2]/length];}
  function subtract(a,b){return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];}
  function quaternionNormalize(q){var length=Math.sqrt(q[0]*q[0]+q[1]*q[1]+q[2]*q[2]+q[3]*q[3])||1;return [q[0]/length,q[1]/length,q[2]/length,q[3]/length];}
  function quaternionMultiply(a,b){
    return [
      a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],
      a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],
      a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],
      a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]
    ];
  }
  function quaternionAxis(axis,angle){
    var unit=normalize(axis),half=angle*.5,sine=Math.sin(half);
    return [unit[0]*sine,unit[1]*sine,unit[2]*sine,Math.cos(half)];
  }
  function quaternionBetween(from,to){
    var a=normalize(from),b=normalize(to),cosine=dot(a,b);
    if(cosine<-0.999999){
      var axis=Math.abs(a[0])<.8?cross(a,[1,0,0]):cross(a,[0,1,0]);
      return quaternionAxis(axis,Math.PI);
    }
    var axis=cross(a,b);
    return quaternionNormalize([axis[0],axis[1],axis[2],1+cosine]);
  }
  function quaternionMatrix(q){
    q=quaternionNormalize(q);
    var x=q[0],y=q[1],z=q[2],w=q[3],xx=x*x,yy=y*y,zz=z*z,xy=x*y,xz=x*z,yz=y*z,wx=w*x,wy=w*y,wz=w*z;
    return new Float32Array([
      1-2*(yy+zz),2*(xy+wz),2*(xz-wy),
      2*(xy-wz),1-2*(xx+zz),2*(yz+wx),
      2*(xz+wy),2*(yz-wx),1-2*(xx+yy)
    ]);
  }
  function pushTriangle(store,a,b,c){
    var normal=normalize(cross(subtract(b,a),subtract(c,a)));
    var centre=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
    if(dot(normal,centre)<0){var swap=b;b=c;c=swap;normal=normalize(cross(subtract(b,a),subtract(c,a)));}
    [a,b,c].forEach(function(vertex){store.positions.push(vertex[0],vertex[1],vertex[2]);store.normals.push(normal[0],normal[1],normal[2]);});
    return normal;
  }
  function pushEdge(store,a,b){store.edges.push(a[0],a[1],a[2],b[0],b[1],b[2]);}
  function cubeGeometry(){
    var s=.72,vertices=[
      [-s,-s,-s],[s,-s,-s],[s,s,-s],[-s,s,-s],
      [-s,-s,s],[s,-s,s],[s,s,s],[-s,s,s]
    ];
    var faces=[[4,5,6,7],[1,0,3,2],[5,1,2,6],[0,4,7,3],[7,6,2,3],[0,1,5,4]];
    var store={positions:[],normals:[],edges:[],faceNormals:[]},seen={};
    faces.forEach(function(face){
      store.faceNormals.push(pushTriangle(store,vertices[face[0]],vertices[face[1]],vertices[face[2]]));
      pushTriangle(store,vertices[face[0]],vertices[face[2]],vertices[face[3]]);
      for(var i=0;i<4;i++){
        var a=face[i],b=face[(i+1)%4],key=Math.min(a,b)+":"+Math.max(a,b);
        if(!seen[key]){seen[key]=true;pushEdge(store,vertices[a],vertices[b]);}
      }
    });
    return store;
  }
  function d20Geometry(){
    var phi=(1+Math.sqrt(5))/2;
    var vertices=[
      [-1,phi,0],[1,phi,0],[-1,-phi,0],[1,-phi,0],
      [0,-1,phi],[0,1,phi],[0,-1,-phi],[0,1,-phi],
      [phi,0,-1],[phi,0,1],[-phi,0,-1],[-phi,0,1]
    ].map(function(vertex){var unit=normalize(vertex);return [unit[0]*.87,unit[1]*.87,unit[2]*.87];});
    var faces=[
      [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
      [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
      [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
      [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]
    ];
    var store={positions:[],normals:[],edges:[],faceNormals:[]},seen={};
    faces.forEach(function(face){
      store.faceNormals.push(pushTriangle(store,vertices[face[0]],vertices[face[1]],vertices[face[2]]));
      for(var i=0;i<3;i++){
        var a=face[i],b=face[(i+1)%3],key=Math.min(a,b)+":"+Math.max(a,b);
        if(!seen[key]){seen[key]=true;pushEdge(store,vertices[a],vertices[b]);}
      }
    });
    return store;
  }
  function geometryFor(sides){
    if(!geometryCache[sides])geometryCache[sides]=Number(sides)===6?cubeGeometry():d20Geometry();
    return geometryCache[sides];
  }
  function shader(gl,type,source){
    var item=gl.createShader(type);gl.shaderSource(item,source);gl.compileShader(item);
    if(!gl.getShaderParameter(item,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(item)||"Dice shader failed");
    return item;
  }
  function program(gl,vertexSource,fragmentSource){
    var item=gl.createProgram();
    gl.attachShader(item,shader(gl,gl.VERTEX_SHADER,vertexSource));
    gl.attachShader(item,shader(gl,gl.FRAGMENT_SHADER,fragmentSource));
    gl.linkProgram(item);
    if(!gl.getProgramParameter(item,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(item)||"Dice program failed");
    return item;
  }
  function buffer(gl,data){
    var item=gl.createBuffer();gl.bindBuffer(gl,gl.ARRAY_BUFFER,item);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);return item;
  }
  function prepareRenderer(canvas,sides,materialName){
    var gl=canvas.getContext("webgl",{alpha:true,antialias:true,premultipliedAlpha:true});
    if(!gl)throw new Error("WebGL unavailable");
    var geo=geometryFor(sides),material=MATERIALS[materialName]||MATERIALS.ivory;
    var meshProgram=program(gl,
      "attribute vec3 aPosition;attribute vec3 aNormal;uniform mat3 uRotation;varying vec3 vNormal;varying vec3 vPosition;void main(){vec3 p=uRotation*aPosition;vNormal=normalize(uRotation*aNormal);vPosition=p;gl_Position=vec4(p.xy*.91,p.z*.22,1.0);}",
      "precision mediump float;uniform vec3 uFill;uniform vec3 uDark;varying vec3 vNormal;varying vec3 vPosition;void main(){vec3 light=normalize(vec3(-.45,.72,1.0));float diffuse=max(dot(normalize(vNormal),light),0.0);float rim=pow(1.0-max(vNormal.z,0.0),2.0)*.14;float shade=.30+.70*diffuse;vec3 colour=mix(uDark,uFill,shade)+rim;gl_FragColor=vec4(colour,1.0);}"
    );
    var lineProgram=program(gl,
      "attribute vec3 aPosition;uniform mat3 uRotation;void main(){vec3 p=uRotation*aPosition;gl_Position=vec4(p.xy*.91,p.z*.22,1.0);}",
      "precision mediump float;uniform vec3 uRim;void main(){gl_FragColor=vec4(uRim,.92);}"
    );
    var positionBuffer=buffer(gl,geo.positions),normalBuffer=buffer(gl,geo.normals),edgeBuffer=buffer(gl,geo.edges);
    var scale=Math.max(1,Math.min(2,window.devicePixelRatio||1)),size=Math.max(32,Math.round(canvas.getBoundingClientRect().width||52));
    canvas.width=Math.round(size*scale);canvas.height=Math.round(size*scale);
    gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,0);gl.enable(gl.DEPTH_TEST);gl.enable(gl.CULL_FACE);
    function attribute(programObject,name,item,sizeValue){
      var location=gl.getAttribLocation(programObject,name);gl.bindBuffer(gl.ARRAY_BUFFER,item);gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,sizeValue,gl.FLOAT,false,0,0);
    }
    return {
      geo:geo,
      draw:function(rotation){
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        gl.useProgram(meshProgram);
        attribute(meshProgram,"aPosition",positionBuffer,3);attribute(meshProgram,"aNormal",normalBuffer,3);
        gl.uniformMatrix3fv(gl.getUniformLocation(meshProgram,"uRotation"),false,rotation);
        gl.uniform3fv(gl.getUniformLocation(meshProgram,"uFill"),hexRgb(material.fill));
        gl.uniform3fv(gl.getUniformLocation(meshProgram,"uDark"),hexRgb(material.dark));
        gl.drawArrays(gl.TRIANGLES,0,geo.positions.length/3);
        gl.useProgram(lineProgram);attribute(lineProgram,"aPosition",edgeBuffer,3);
        gl.uniformMatrix3fv(gl.getUniformLocation(lineProgram,"uRotation"),false,rotation);
        gl.uniform3fv(gl.getUniformLocation(lineProgram,"uRim"),hexRgb(material.rim));
        gl.drawArrays(gl.LINES,0,geo.edges.length/3);
      }
    };
  }
  function mountDie(host){
    var canvas=host.querySelector("canvas"),number=host.querySelector(".fh-cd-static3d-result");
    if(!canvas||!number)return;
    var sides=Number(host.dataset.sides)||20,result=Math.max(1,Math.min(sides,Number(host.dataset.result)||1));
    var materialName=host.dataset.material||"ivory",renderer;
    try{renderer=prepareRenderer(canvas,sides,materialName);}
    catch(error){return;}
    host.classList.add("is-webgl");
    number.style.color=(MATERIALS[materialName]||MATERIALS.ivory).num;
    var face=renderer.geo.faceNormals[(result-1)%renderer.geo.faceNormals.length]||[0,0,1];
    var finalRotation=quaternionBetween(face,[0,0,1]);
    var animate=host.dataset.animate==="1"&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var index=Number(host.dataset.index)||0,duration=920,delay=index*65,start=null;
    function drawFrame(now){
      if(!canvas.isConnected)return;
      if(start===null)start=now+delay;
      var elapsed=now-start;
      if(elapsed<0){renderer.draw(quaternionMatrix(finalRotation));requestAnimationFrame(drawFrame);return;}
      var progress=animate?Math.max(0,Math.min(1,elapsed/duration)):1;
      var eased=1-Math.pow(1-progress,3),remaining=1-eased;
      var seed=(result*17+index*11+sides)%23;
      var qx=quaternionAxis([1,.22,.08],remaining*Math.PI*2*(2.75+(seed%5)*.18));
      var qy=quaternionAxis([.12,1,.31],remaining*Math.PI*2*(2.35+(seed%7)*.14));
      var qz=quaternionAxis([.05,.18,1],remaining*Math.PI*2*(.35+(seed%3)*.11));
      var rotation=quaternionMultiply(qz,quaternionMultiply(qy,quaternionMultiply(qx,finalRotation)));
      renderer.draw(quaternionMatrix(rotation));
      if(progress>.72)host.classList.add("is-settled");
      if(progress<1)requestAnimationFrame(drawFrame);
      else host.classList.add("is-settled");
    }
    requestAnimationFrame(drawFrame);
  }
  function mount(scope){
    if(!scope||!scope.querySelectorAll)return;
    scope.querySelectorAll(".fh-cd-static3d:not([data-mounted])").forEach(function(host){
      host.setAttribute("data-mounted","1");mountDie(host);
    });
  }

  window.FHStaticDice={mount:mount};
}());
