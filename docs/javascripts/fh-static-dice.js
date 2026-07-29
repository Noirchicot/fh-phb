/* Fate's Hand — static 3D dice renderer.
   The roller owns randomness. This module renders the ready pose or animates a
   result FHPC has already resolved, without moving a die across the tray. */
(function () {
  "use strict";

  var SUPPORTED_SIDES = [4,6,8,10,12,20,100];
  var MATERIALS = {
    ivory:{fill:"#f3ead6",light:"#fffaf0",dark:"#c6b78f",rim:"#76551e",num:"#58180d"},
    gold:{fill:"#d9b25e",light:"#f3d98c",dark:"#97701d",rim:"#62420c",num:"#3a2606"},
    green:{fill:"#3d7d56",light:"#72aa83",dark:"#193d27",rim:"#10271a",num:"#f2ead2"},
    crit:{fill:"#f0c550",light:"#ffe49b",dark:"#b87918",rim:"#62420c",num:"#3a2606"},
    fumble:{fill:"#b51d25",light:"#e35559",dark:"#600c12",rim:"#41090d",num:"#fff0ee"},
    chaos:{fill:"#8f1118",light:"#d02d35",dark:"#350306",rim:"#ff6c73",num:"#fff0ee"},
    crimson:{fill:"#93303a",light:"#c05a63",dark:"#51121b",rim:"#3d0c13",num:"#ffeceb"},
    azure:{fill:"#2f5f86",light:"#6596bb",dark:"#12334d",rim:"#0d2334",num:"#eef6fd"},
    violet:{fill:"#5c3d7e",light:"#906db0",dark:"#301a42",rim:"#1d1029",num:"#f5edff"},
    slate:{fill:"#4a4f55",light:"#7b828a",dark:"#25292e",rim:"#171a1d",num:"#f0f2f4"},
    white:{fill:"#fbf8f1",light:"#ffffff",dark:"#d9cfb9",rim:"#8b7546",num:"#5a4a2a"}
  };
  var geometryCache = {};
  var soundContext = null;
  var soundMuted = readStoredMute();
  var SOUND_PROFILE = {
    volume:.18,
    impacts:[
      {time:.03,strength:.42},
      {time:.16,strength:.34},
      {time:.30,strength:.46},
      {time:.46,strength:.37},
      {time:.63,strength:.51},
      {time:.78,strength:.43}
    ],
    landing:{time:.91,strength:.82}
  };

  function readStoredMute(){
    try{return Boolean(window.localStorage&&window.localStorage.getItem("fh-static-dice-muted")==="1");}
    catch(error){return false;}
  }
  function setSoundMuted(muted){
    soundMuted=Boolean(muted);
    try{if(window.localStorage)window.localStorage.setItem("fh-static-dice-muted",soundMuted?"1":"0");}
    catch(error){}
    return soundMuted;
  }
  function setSoundVolume(volume){
    SOUND_PROFILE.volume=Math.max(0,Math.min(.35,Number(volume)||0));
    return SOUND_PROFILE.volume;
  }
  function audioContext(){
    if(soundMuted)return null;
    var AudioContext=window.AudioContext||window.webkitAudioContext;
    if(!AudioContext)return null;
    try{
      if(!soundContext)soundContext=new AudioContext();
      if(soundContext.state==="suspended"&&soundContext.resume)soundContext.resume();
      return soundContext;
    }catch(error){return null;}
  }
  function seededNoise(seed){
    var state=(Number(seed)||1)>>>0;
    return function(){
      state=(state*1664525+1013904223)>>>0;
      return state/4294967296;
    };
  }
  function scheduleImpact(context,time,strength,pitch,seed){
    var duration=.045,length=Math.max(1,Math.floor(context.sampleRate*duration));
    var buffer=context.createBuffer(1,length,context.sampleRate),data=buffer.getChannelData(0),noise=seededNoise(seed);
    for(var sample=0;sample<length;sample++)data[sample]=(noise()*2-1)*Math.pow(1-sample/length,3);
    var source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();
    source.buffer=buffer;filter.type="bandpass";
    filter.frequency.setValueAtTime(pitch*3.2,time);filter.Q.setValueAtTime(1.7,time);
    gain.gain.setValueAtTime(.0001,time);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0001,SOUND_PROFILE.volume*strength),time+.003);
    gain.gain.exponentialRampToValueAtTime(.0001,time+duration);
    source.connect(filter);filter.connect(gain);gain.connect(context.destination);
    source.start(time);source.stop(time+duration);

    var body=context.createOscillator(),bodyGain=context.createGain();
    body.type="triangle";body.frequency.setValueAtTime(pitch,time);
    body.frequency.exponentialRampToValueAtTime(Math.max(45,pitch*.58),time+.055);
    bodyGain.gain.setValueAtTime(.0001,time);
    bodyGain.gain.exponentialRampToValueAtTime(Math.max(.0001,SOUND_PROFILE.volume*strength*.32),time+.002);
    bodyGain.gain.exponentialRampToValueAtTime(.0001,time+.06);
    body.connect(bodyGain);bodyGain.connect(context.destination);
    body.start(time);body.stop(time+.065);
  }
  function playRollSound(sides,index){
    var context=audioContext();
    if(!context)return false;
    var sideCount=Number(sides)||20,sequence=Number(index)||0;
    var weight=Math.max(.62,Math.min(1.08,1.12-Math.log(sideCount)/8));
    var pitch=175*weight,offset=context.currentTime+.012+Math.max(0,sequence)*.042;
    SOUND_PROFILE.impacts.forEach(function(impact,impactIndex){
      scheduleImpact(context,offset+impact.time,impact.strength,pitch*(1+(impactIndex%3)*.08),sideCount*97+sequence*31+impactIndex);
    });
    scheduleImpact(context,offset+SOUND_PROFILE.landing.time,SOUND_PROFILE.landing.strength,pitch*.72,sideCount*131+sequence*43);
    return true;
  }

  function hexRgb(hex) {
    var value=parseInt(String(hex||"#ffffff").replace("#",""),16);
    return [((value>>16)&255)/255,((value>>8)&255)/255,(value&255)/255];
  }
  function add(a,b){return [a[0]+b[0],a[1]+b[1],a[2]+b[2]];}
  function scaleVector(v,amount){return [v[0]*amount,v[1]*amount,v[2]*amount];}
  function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
  function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
  function length(v){return Math.sqrt(dot(v,v));}
  function normalize(v){var amount=length(v)||1;return [v[0]/amount,v[1]/amount,v[2]/amount];}
  function subtract(a,b){return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];}
  function centreOf(points){
    var sum=points.reduce(function(total,point){return add(total,point);},[0,0,0]);
    return scaleVector(sum,1/points.length);
  }
  function quaternionNormalize(q){var amount=Math.sqrt(q[0]*q[0]+q[1]*q[1]+q[2]*q[2]+q[3]*q[3])||1;return [q[0]/amount,q[1]/amount,q[2]/amount,q[3]/amount];}
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
      var fallback=Math.abs(a[0])<.8?cross(a,[1,0,0]):cross(a,[0,1,0]);
      return quaternionAxis(fallback,Math.PI);
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
  function quaternionRotate(q,v){
    q=quaternionNormalize(q);
    var vector=[q[0],q[1],q[2]],scalar=q[3];
    return add(add(scaleVector(vector,2*dot(vector,v)),scaleVector(v,scalar*scalar-dot(vector,vector))),scaleVector(cross(vector,v),2*scalar));
  }
  function pushVertex(store,position,normal){
    store.positions.push(position[0],position[1],position[2]);
    store.normals.push(normal[0],normal[1],normal[2]);
  }
  function pushFlatTriangle(store,a,b,c,normal){
    pushVertex(store,a,normal);pushVertex(store,b,normal);pushVertex(store,c,normal);
  }
  function pushSmoothTriangle(store,a,b,c){
    var orientation=cross(subtract(b.position,a.position),subtract(c.position,a.position));
    if(dot(orientation,centreOf([a.position,b.position,c.position]))<0){var swap=b;b=c;c=swap;}
    pushVertex(store,a.position,a.normal);pushVertex(store,b.position,b.normal);pushVertex(store,c.position,c.normal);
  }
  function pushEdge(store,a,b){store.edges.push(a[0],a[1],a[2],b[0],b[1],b[2]);}

  function polygonGeometry(vertices,faces){
    var store={positions:[],normals:[],edges:[],faceNormals:[],faceUps:[]},seen={};
    faces.forEach(function(originalFace){
      var face=originalFace.slice(),upAnchor=vertices[originalFace[0]],points=face.map(function(index){return vertices[index];});
      var normal=normalize(cross(subtract(points[1],points[0]),subtract(points[2],points[0])));
      if(dot(normal,centreOf(points))<0){
        face.reverse();points=face.map(function(index){return vertices[index];});
        normal=normalize(cross(subtract(points[1],points[0]),subtract(points[2],points[0])));
      }
      store.faceNormals.push(normal);
      store.faceUps.push(normalize(subtract(upAnchor,centreOf(points))));
      for(var triangle=1;triangle<points.length-1;triangle++)pushFlatTriangle(store,points[0],points[triangle],points[triangle+1],normal);
      for(var edge=0;edge<face.length;edge++){
        var a=face[edge],b=face[(edge+1)%face.length],key=Math.min(a,b)+":"+Math.max(a,b);
        if(!seen[key]){seen[key]=true;pushEdge(store,vertices[a],vertices[b]);}
      }
    });
    return store;
  }

  /* Find the planar hull faces of a small, centred convex polyhedron. This
     keeps the source readable for solids such as the d12's dodecahedron. */
  function convexFaces(vertices){
    var epsilon=.00001,faces=[],seen={};
    for(var a=0;a<vertices.length-2;a++)for(var b=a+1;b<vertices.length-1;b++)for(var c=b+1;c<vertices.length;c++){
      var raw=cross(subtract(vertices[b],vertices[a]),subtract(vertices[c],vertices[a]));
      if(length(raw)<epsilon)continue;
      var normal=normalize(raw),distance=dot(normal,vertices[a]),positive=false,negative=false;
      vertices.forEach(function(vertex){
        var side=dot(normal,vertex)-distance;
        if(side>epsilon)positive=true;if(side<-epsilon)negative=true;
      });
      if(positive&&negative)continue;
      var indices=[];
      vertices.forEach(function(vertex,index){if(Math.abs(dot(normal,vertex)-distance)<epsilon)indices.push(index);});
      if(indices.length<3)continue;
      var key=indices.slice().sort(function(x,y){return x-y;}).join(":");
      if(seen[key])continue;seen[key]=true;
      var faceCentre=centreOf(indices.map(function(index){return vertices[index];}));
      if(dot(normal,faceCentre)<0)normal=scaleVector(normal,-1);
      var basisU=normalize(subtract(vertices[indices[0]],faceCentre)),basisV=cross(normal,basisU);
      indices.sort(function(left,right){
        var l=subtract(vertices[left],faceCentre),r=subtract(vertices[right],faceCentre);
        return Math.atan2(dot(l,basisV),dot(l,basisU))-Math.atan2(dot(r,basisV),dot(r,basisU));
      });
      faces.push(indices);
    }
    return faces;
  }

  function cubeGeometry(){
    var size=.72,vertices=[
      [-size,-size,-size],[size,-size,-size],[size,size,-size],[-size,size,-size],
      [-size,-size,size],[size,-size,size],[size,size,size],[-size,size,size]
    ];
    var store=polygonGeometry(vertices,[
      [4,5,6,7],[1,0,3,2],[5,1,2,6],
      [0,4,7,3],[7,6,2,3],[0,1,5,4]
    ]);
    store.faceUps=[[0,1,0],[0,1,0],[0,0,1],[0,0,1],[1,0,0],[1,0,0]];
    return store;
  }

  function roundedCubeGeometry(){
    var outer=.76,radius=.16,core=outer-radius,steps=8;
    var store={positions:[],normals:[],edges:[],faceNormals:[],faceUps:[]};
    var faces=[
      {normal:[0,0,1],u:[1,0,0],v:[0,1,0]},
      {normal:[0,0,-1],u:[-1,0,0],v:[0,1,0]},
      {normal:[1,0,0],u:[0,1,0],v:[0,0,1]},
      {normal:[-1,0,0],u:[0,-1,0],v:[0,0,1]},
      {normal:[0,1,0],u:[0,0,1],v:[1,0,0]},
      {normal:[0,-1,0],u:[0,0,-1],v:[1,0,0]}
    ];
    function surfacePoint(face,u,v){
      var raw=add(scaleVector(face.normal,outer),add(scaleVector(face.u,u),scaleVector(face.v,v)));
      var clamped=raw.map(function(value){return Math.max(-core,Math.min(core,value));});
      var delta=subtract(raw,clamped),normal=normalize(delta);
      return {position:add(clamped,scaleVector(normal,radius)),normal:normal};
    }
    faces.forEach(function(face){
      store.faceNormals.push(face.normal);
      store.faceUps.push(face.v);
      for(var row=0;row<steps;row++)for(var column=0;column<steps;column++){
        var u0=-outer+2*outer*column/steps,u1=-outer+2*outer*(column+1)/steps;
        var v0=-outer+2*outer*row/steps,v1=-outer+2*outer*(row+1)/steps;
        var p00=surfacePoint(face,u0,v0),p10=surfacePoint(face,u1,v0),p11=surfacePoint(face,u1,v1),p01=surfacePoint(face,u0,v1);
        pushSmoothTriangle(store,p00,p10,p11);pushSmoothTriangle(store,p00,p11,p01);
      }
      var corners=[[-core,-core],[core,-core],[core,core],[-core,core]];
      corners.forEach(function(corner,index){
        var next=corners[(index+1)%corners.length];
        pushEdge(store,surfacePoint(face,corner[0],corner[1]).position,surfacePoint(face,next[0],next[1]).position);
      });
    });
    return store;
  }
  function tetrahedronGeometry(){
    var vertices=[[1,1,1],[-1,-1,1],[-1,1,-1],[1,-1,-1]].map(function(vertex){return scaleVector(normalize(vertex),.88);});
    return polygonGeometry(vertices,[[0,1,2],[0,3,1],[0,2,3],[1,3,2]]);
  }
  function octahedronGeometry(){
    var vertices=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]].map(function(vertex){return scaleVector(vertex,.91);});
    return polygonGeometry(vertices,convexFaces(vertices));
  }
  function trapezohedronGeometry(){
    /* A real d10 is a pentagonal trapezohedron: ten kites around a broad
       equator. Keeping the poles lower avoids the stretched-d8 silhouette. */
    var pole=.70,radius=.84,ringHeight=pole/9.472135955;
    var vertices=[[0,0,pole],[0,0,-pole]];
    for(var i=0;i<5;i++)vertices.push([Math.cos(i*Math.PI*2/5)*radius,Math.sin(i*Math.PI*2/5)*radius,ringHeight]);
    for(var j=0;j<5;j++)vertices.push([Math.cos((j+.5)*Math.PI*2/5)*radius,Math.sin((j+.5)*Math.PI*2/5)*radius,-ringHeight]);
    var faces=[];
    for(var face=0;face<5;face++){
      var upper=2+face,nextUpper=2+(face+1)%5,lower=7+face,nextLower=7+(face+1)%5;
      faces.push([0,upper,lower,nextUpper]);
      faces.push([1,lower,nextUpper,nextLower]);
    }
    return polygonGeometry(vertices,faces);
  }
  function dodecahedronGeometry(){
    var phi=(1+Math.sqrt(5))/2,inverse=1/phi,raw=[];
    [-1,1].forEach(function(x){[-1,1].forEach(function(y){[-1,1].forEach(function(z){raw.push([x,y,z]);});});});
    [-1,1].forEach(function(a){[-1,1].forEach(function(b){
      raw.push([0,a*inverse,b*phi]);raw.push([a*inverse,b*phi,0]);raw.push([a*phi,0,b*inverse]);
    });});
    var vertices=raw.map(function(vertex){return scaleVector(vertex,.89/Math.sqrt(3));});
    return polygonGeometry(vertices,convexFaces(vertices));
  }
  function icosahedronGeometry(){
    var phi=(1+Math.sqrt(5))/2;
    var vertices=[
      [-1,phi,0],[1,phi,0],[-1,-phi,0],[1,-phi,0],
      [0,-1,phi],[0,1,phi],[0,-1,-phi],[0,1,-phi],
      [phi,0,-1],[phi,0,1],[-phi,0,-1],[-phi,0,1]
    ].map(function(vertex){return scaleVector(normalize(vertex),.89);});
    var faces=[
      [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
      [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
      [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
      [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]
    ];
    return polygonGeometry(vertices,faces);
  }
  function geometryFor(sides){
    sides=Number(sides);
    if(!geometryCache[sides]){
      if(sides===4)geometryCache[sides]=tetrahedronGeometry();
      else if(sides===6)geometryCache[sides]=cubeGeometry();
      else if(sides===8)geometryCache[sides]=octahedronGeometry();
      else if(sides===10||sides===100)geometryCache[sides]=trapezohedronGeometry();
      else if(sides===12)geometryCache[sides]=dodecahedronGeometry();
      else geometryCache[sides]=icosahedronGeometry();
    }
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
    /* bindBuffer takes (target, buffer), not (gl, target, buffer). Same bug,
       same place, third time on this branch (fixed on the audit branch at
       9f8fd76 for V1, again at 4e8cbd7 for V2; V3 was written fresh from
       64237e6 again and reintroduced it a third time). Throws a TypeError on
       the first draw call, silently caught in mountDie, every die falls back
       to SVG -- undetectable by the Node/linkedom test suite, which has no
       WebGL context. */
    var item=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,item);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);return item;
  }
  function prepareRenderer(canvas,sides,materialName,sizePx){
    var gl=canvas.getContext("webgl",{alpha:true,antialias:true,premultipliedAlpha:true});
    if(!gl)throw new Error("WebGL unavailable");
    var geo=geometryFor(sides),material=MATERIALS[materialName]||MATERIALS.ivory;
    var meshProgram=program(gl,
      "attribute vec3 aPosition;attribute vec3 aNormal;uniform mat3 uRotation;varying vec3 vNormal;varying vec3 vPosition;void main(){vec3 p=uRotation*aPosition;float depth=1.0+p.z*.10;vNormal=normalize(uRotation*aNormal);vPosition=p;gl_Position=vec4(p.xy*.89*depth,-p.z*.22,1.0);}",
      "precision mediump float;uniform vec3 uFill;uniform vec3 uLight;uniform vec3 uDark;varying vec3 vNormal;varying vec3 vPosition;void main(){vec3 n=normalize(vNormal);vec3 key=normalize(vec3(-.48,.72,1.0));vec3 fillLight=normalize(vec3(.68,-.28,.52));vec3 view=vec3(0.0,0.0,1.0);float diffuse=max(dot(n,key),0.0);float bounce=max(dot(n,fillLight),0.0);float shade=clamp(.16+.68*diffuse+.16*bounce,0.0,1.0);float specular=pow(max(dot(n,normalize(key+view)),0.0),28.0);float fresnel=pow(1.0-max(dot(n,view),0.0),3.0);vec3 colour=mix(uDark,uFill,shade);colour=mix(colour,uLight,clamp(specular*.32+fresnel*.075,0.0,.38));gl_FragColor=vec4(colour,1.0);}"
    );
    var lineProgram=program(gl,
      "attribute vec3 aPosition;uniform mat3 uRotation;void main(){vec3 p=uRotation*aPosition;float depth=1.0+p.z*.10;gl_Position=vec4(p.xy*.89*depth,-p.z*.22-.001,1.0);}",
      "precision mediump float;uniform vec3 uRim;void main(){gl_FragColor=vec4(uRim,1.0);}"
    );
    var positionBuffer=buffer(gl,geo.positions),normalBuffer=buffer(gl,geo.normals),edgeBuffer=buffer(gl,geo.edges);
    /* canvas (and, for the d100 pair, its .fh-cd-static3d-part parent) are
       both display:none until is-webgl reveals them, which only happens
       AFTER this function returns -- so getBoundingClientRect() is always
       0x0 here and every die silently got the ||52 fallback regardless of
       its real size. Worse for d100 than for a single die: measuring
       canvas.parentElement doesn't help there either, because the part
       wrapper is the hidden element. The caller already knows the true
       target size (it built the inline --fh-static-die-size style), so it
       is passed straight through instead of re-derived from layout. */
    var pixelRatio=Math.max(1,Math.min(2,window.devicePixelRatio||1)),size=Math.max(32,Math.round(sizePx||canvas.getBoundingClientRect().width||52));
    canvas.width=Math.round(size*pixelRatio);canvas.height=Math.round(size*pixelRatio);
    gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,0);
    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.depthMask(true);
    gl.enable(gl.CULL_FACE);gl.frontFace(gl.CCW);gl.cullFace(gl.BACK);gl.disable(gl.BLEND);
    if(gl.POLYGON_OFFSET_FILL!=null&&gl.polygonOffset){gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(1,1);}
    if(gl.lineWidth)gl.lineWidth(Math.max(1,pixelRatio));
    function attribute(programObject,name,item,sizeValue){
      var location=gl.getAttribLocation(programObject,name);gl.bindBuffer(gl.ARRAY_BUFFER,item);gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,sizeValue,gl.FLOAT,false,0,0);
    }
    return {
      geo:geo,
      draw:function(rotation){
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.disable(gl.BLEND);
        gl.useProgram(meshProgram);
        attribute(meshProgram,"aPosition",positionBuffer,3);attribute(meshProgram,"aNormal",normalBuffer,3);
        gl.uniformMatrix3fv(gl.getUniformLocation(meshProgram,"uRotation"),false,rotation);
        gl.uniform3fv(gl.getUniformLocation(meshProgram,"uFill"),hexRgb(material.fill));
        gl.uniform3fv(gl.getUniformLocation(meshProgram,"uLight"),hexRgb(material.light));
        gl.uniform3fv(gl.getUniformLocation(meshProgram,"uDark"),hexRgb(material.dark));
        gl.drawArrays(gl.TRIANGLES,0,geo.positions.length/3);
        gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.disable(gl.BLEND);
        gl.useProgram(lineProgram);attribute(lineProgram,"aPosition",edgeBuffer,3);
        gl.uniformMatrix3fv(gl.getUniformLocation(lineProgram,"uRotation"),false,rotation);
        gl.uniform3fv(gl.getUniformLocation(lineProgram,"uRim"),hexRgb(material.rim));
        gl.drawArrays(gl.LINES,0,geo.edges.length/3);
      }
    };
  }
  function faceRotation(geo,faceIndex,renderSides){
    var target=normalize(Number(renderSides)===6?[0,.28,1]:[0,-.12,1]),normal=geo.faceNormals[faceIndex]||[0,0,1];
    var base=quaternionBetween(normal,target),up=geo.faceUps[faceIndex]||[0,1,0],rotatedUp=quaternionRotate(base,up);
    var roll=quaternionAxis(target,Math.PI*.5-Math.atan2(rotatedUp[1],rotatedUp[0]));
    return quaternionMultiply(roll,base);
  }
  function displayValue(sides,result){
    return Number(sides)===10&&Number(result)===10?"0":String(result);
  }
  function animatePart(host,canvas,number,renderSides,faceIndex,seedResult,sequenceIndex,materialName,animate,sizePx){
    var renderer;
    try{renderer=prepareRenderer(canvas,renderSides,materialName,sizePx);}
    catch(error){return false;}
    number.style.color=(MATERIALS[materialName]||MATERIALS.ivory).num;
    var finalRotation=faceRotation(renderer.geo,faceIndex,renderSides);
    var startRotation=faceRotation(renderer.geo,0,renderSides);
    var duration=960,delay=animate?sequenceIndex*42:0,start=null;
    function drawFrame(now){
      if(!canvas.isConnected)return;
      if(start===null)start=now+delay;
      var elapsed=now-start;
      if(elapsed<0){renderer.draw(quaternionMatrix(startRotation));requestAnimationFrame(drawFrame);return;}
      var progress=animate?Math.max(0,Math.min(1,elapsed/duration)):1;
      var eased=1-Math.pow(1-progress,3),remaining=1-eased;
      var seed=(seedResult*17+sequenceIndex*11+renderSides)%23;
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
    return true;
  }
  function mountDie(host){
    var sides=Number(host.dataset.sides)||20,result=Math.max(1,Math.min(sides,Number(host.dataset.result)||1));
    var materialName=host.dataset.material||"ivory",pending=host.dataset.pending==="1";
    var animate=!pending&&host.dataset.animate==="1"&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var index=Number(host.dataset.index)||0;
    /* Read straight off the inline style the markup already carries, rather
       than measuring the DOM: host itself is laid out, but its children
       (canvas, and for d100 the .fh-cd-static3d-part halves) are all
       display:none at this point, so any rect-based measurement of them
       is 0x0 regardless of what the CSS says their eventual size will be. */
    var hostSizePx=parseFloat(host.style&&host.style.getPropertyValue("--fh-static-die-size"))||52;
    if(sides===100){
      var parts=host.querySelectorAll(".fh-cd-static3d-part");
      if(!parts||parts.length!==2)return;
      var partSizePx=hostSizePx*.78; /* matches the .78 ratio in companion-dock.css */
      var percentile=result===100?"00":String(result).padStart(2,"0"),mounted=true;
      parts.forEach(function(part,partIndex){
        var canvas=part.querySelector("canvas"),number=part.querySelector(".fh-cd-static3d-result");
        var digit=Number(percentile.charAt(partIndex)),faceIndex=digit===0?9:digit-1;
        if(!canvas||!number){mounted=false;return;}
        number.textContent=pending?"":String(digit);
        if(!animatePart(host,canvas,number,10,faceIndex,result,index*2+partIndex,materialName,animate,partSizePx))mounted=false;
      });
      if(mounted){
        host.classList.add("is-webgl");host.classList.add("is-percentile");
        if(animate)playRollSound(sides,index);
      }
      return;
    }
    var canvas=host.querySelector("canvas"),number=host.querySelector(".fh-cd-static3d-result");
    if(!canvas||!number)return;
    number.textContent=pending?"":displayValue(sides,result);
    if(animatePart(host,canvas,number,sides,(result-1)%geometryFor(sides).faceNormals.length,result,index,materialName,animate,hostSizePx)){
      host.classList.add("is-webgl");
      if(animate)playRollSound(sides,index);
    }
  }
  function mount(scope){
    if(!scope||!scope.querySelectorAll)return;
    scope.querySelectorAll(".fh-cd-static3d:not([data-mounted])").forEach(function(host){
      host.setAttribute("data-mounted","1");mountDie(host);
    });
  }

  window.FHStaticDice={
    mount:mount,
    supportedSides:SUPPORTED_SIDES.slice(),
    materials:Object.keys(MATERIALS),
    sound:{
      isMuted:function(){return soundMuted;},
      setMuted:setSoundMuted,
      setVolume:setSoundVolume,
      preview:function(sides){return playRollSound(Number(sides)||20,0);}
    }
  };
}());
