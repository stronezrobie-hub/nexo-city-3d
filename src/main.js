import * as T from 'three';
const el=id=>document.getElementById(id),W=window;
const scene=new T.Scene();scene.background=new T.Color('#93ccf5');scene.fog=new T.Fog('#93ccf5',125,380);
const skyShader=new T.ShaderMaterial({
 side:T.BackSide,depthWrite:false,fog:false,
 uniforms:{uNight:{value:0}},
 vertexShader:'varying vec3 vDir; void main(){vDir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'varying vec3 vDir; uniform float uNight; void main(){ vec3 d=normalize(vDir); float h=smoothstep(-0.14,0.96,d.y); vec3 low=vec3(.91,.83,.71),high=vec3(.27,.60,.87); vec3 day=mix(low,high,pow(h,.67)); float sunset=exp(-pow((d.y-.07)*6.,2.))*.14; day+=vec3(.95,.57,.30)*sunset; float sunlight=pow(max(0.,dot(d,normalize(vec3(-.54,.62,-.41)))),520.); day+=vec3(1.,.91,.72)*sunlight*2.1; vec3 night=mix(vec3(.06,.10,.19),vec3(.015,.035,.10),h); float moon=pow(max(0.,dot(d,normalize(vec3(.36,.48,.63)))),680.); night+=vec3(.6,.71,.93)*moon*.65; gl_FragColor=vec4(mix(day,night,uNight),1.); }'
});
const skyDome=new T.Mesh(new T.SphereGeometry(480,34,18),skyShader);skyDome.renderOrder=-999;scene.add(skyDome);
const renderer=new T.WebGLRenderer({canvas:el('world'),antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,matchMedia('(pointer:coarse)').matches?1:1.5));renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;
renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
const cam=new T.PerspectiveCamera(65,innerWidth/innerHeight,.1,800),clock=new T.Clock();
const amb=new T.HemisphereLight(0xe2f6ff,0x72906b,2.1);scene.add(amb);
const sun=new T.DirectionalLight(0xffe9c9,2.65);sun.position.set(-75,140,90);sun.castShadow=true;sun.shadow.mapSize.set(matchMedia('(pointer:coarse)').matches?768:2048,matchMedia('(pointer:coarse)').matches?768:2048);sun.shadow.normalBias=.035;sun.shadow.camera.left=-105;sun.shadow.camera.right=105;sun.shadow.camera.top=105;sun.shadow.camera.bottom=-105;sun.shadow.camera.far=350;scene.add(sun);
const mat=(c,roughness=.8)=>new T.MeshStandardMaterial({color:c,roughness});
const m={grass:mat(0x66a46c),road:mat(0x3c4856),side:mat(0xa3adb3),stripe:mat(0xe5dcad),glass:mat(0x80c1d9,.25),dark:mat(0x243442),tree:mat(0x52895d),leaf2:mat(0x75a96b),wood:mat(0x73543c),roof:mat(0x445d65),trim:mat(0xe7e1d1),yellow:new T.MeshBasicMaterial({color:0xc4ff63}),white:mat(0xf5eee3)};
const colliders=[],homes=[],businesses=[],trees=[],traffic=[];
/* Surface textures generated procedurally on Canvas, no downloaded assets. */
function proceduralTexture(kind,scaleX=6,scaleY=6){
 const cv=document.createElement('canvas');cv.width=cv.height=128;const g=cv.getContext('2d');
 let state=(kind.length*48611+73)>>>0;const rnd=()=>{state=(state*1664525+1013904223)>>>0;return state/4294967296};
 g.fillStyle=kind==='road'?'#d5d9da':kind==='grass'?'#d4ddc7':'#e3e8e5';g.fillRect(0,0,128,128);
 for(let k=0;k<(kind==='road'?1800:2800);k++){
   const light=Math.floor(rnd()*55),x=Math.floor(rnd()*128),y=Math.floor(rnd()*128);
   g.fillStyle=kind==='grass'?'rgba('+(50+light)+','+(85+light)+','+(40+light)+',.16)':rnd()>.5?'rgba(42,61,68,'+(rnd()*.18)+')':'rgba(255,255,255,'+(rnd()*.16)+')';
   g.fillRect(x,y,kind==='grass'?2:1,kind==='grass'?4:1);
 }
 if(kind==='pavement'){g.strokeStyle='rgba(80,91,101,.20)';g.lineWidth=1;for(let v=0;v<=128;v+=32){g.beginPath();g.moveTo(v,0);g.lineTo(v,128);g.moveTo(0,v);g.lineTo(128,v);g.stroke()}}
 const t=new T.CanvasTexture(cv);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(scaleX,scaleY);t.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),4);return t;
}
m.grass.map=proceduralTexture('grass',42,42);m.grass.needsUpdate=true;
m.road.map=proceduralTexture('road',3,38);m.road.needsUpdate=true;
m.side.map=proceduralTexture('pavement',4,4);m.side.needsUpdate=true;
function cube(parent,x,y,z,w,h,d,material,shadow=true){const o=new T.Mesh(new T.BoxGeometry(w,h,d),material);o.position.set(x,y,z);o.castShadow=shadow;o.receiveShadow=true;parent.add(o);return o}
function prism(parent,x,y,z,r,h,material,sides=6){const o=new T.Mesh(new T.ConeGeometry(r,h,sides),material);o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o}
let rng=2941;function random(){rng=(1664525*rng+1013904223)>>>0;return rng/4294967296}function rr(a,b){return a+(b-a)*random()}
function addCollider(x,z,w,d){colliders.push({x1:x-w/2-.3,x2:x+w/2+.3,z1:z-d/2-.3,z2:z+d/2+.3})}
cube(scene,0,-.12,0,420,.2,420,m.grass,false);
for(let k=-3;k<=3;k++){
 cube(scene,k*60,0,0,14,.13,420,m.road,false);cube(scene,0,.01,k*60,420,.13,14,m.road,false);
 for(let v=-195;v<=195;v+=9){if(Math.abs((v+180)%60)<10)continue;
 cube(scene,k*60,.092,v,.17,.016,3.3,m.stripe,false);cube(scene,v,.093,k*60,3.3,.016,.17,m.stripe,false)}
}
const palettes=[0xf9d28f,0xcbeaf0,0xe7b7aa,0xc5d4b9,0xcdbfe4,0xe9e9d5,0xc5cfdd].map(mat);
const treeFoliagePalette=[m.tree,m.leaf2,mat(0x518f56),mat(0x8cb574)];
function plant(x,z,s=1){
 cube(scene,x,1.8*s,z,.52*s,3.6*s,.52*s,m.wood);
 const variant=Math.floor(random()*treeFoliagePalette.length),foliage=treeFoliagePalette[variant];
 for(let layer=0;layer<3;layer++){
   const crown=new T.Mesh(new T.IcosahedronGeometry((2.1+layer*.27)*s,1),foliage);
   crown.position.set(x+(layer===1?.38:-.23)*s,(4.6+layer*.77)*s,z+(layer===1?-.22:.16)*s);
   crown.scale.set(1.12,.8,1.1);
   crown.castShadow=layer===2;crown.receiveShadow=true;scene.add(crown);
 }
}
const streetLightSpots=[];
const lampGlass=new T.MeshStandardMaterial({color:0xffdfaa,emissive:0xffd9a4,emissiveIntensity:1.2,roughness:.22});
function streetLight(x,z){
 cube(scene,x,4,z,.2,8,.2,m.dark,false);
 cube(scene,x+1,8,z,2,.22,.22,m.dark,false);
 cube(scene,x+2,7.82,z,.9,.15,.74,lampGlass,false);
 streetLightSpots.push([x+2,7.7,z]);
}
function windows(x,y,z,ww,levels,front=1){for(let a=0;a<levels;a++)for(let b=0;b<3;b++)cube(scene,x+(b-1)*(ww/3.6),y+3+a*3.7,z+front*.16,1.65,1.65,.18,m.glass,false)}
function home(x,z,id){
 const color=palettes[Math.floor(random()*palettes.length)],height=rr(8,11);
 cube(scene,x,.15,z+2,48,.27,45,m.side,false);
 const facade=cube(scene,x,height/2+.3,z-7,20,height,20,color);addCollider(x,z-7,20,20);
 cube(scene,x,height+.4,z-7,22,.3,22,m.roof);
 prism(scene,x,height+4.1,z-7,15.6,7.4,m.roof,4).rotation.y=Math.PI/4;
 cube(scene,x,.95,z+3,3.6,1.9,.2,m.wood,false);
 for(const dx of [-6,6])for(const zz of [-1,-13])cube(scene,x+dx,5,z+zz,3.1,3.1,.2,m.glass,false);
 for(let t=0;t<2;t++)plant(x+(t?18:-18),z+rr(4,13),rr(.55,.85));
 const pos=new T.Vector3(x,0,z+11),sign=cube(scene,x-9,1.4,z+11,.3,2.5,.3,m.dark,false);
 cube(scene,x-9,2.65,z+11,3,.9,.26,m.yellow,false);
 homes.push({id,x,z,entry:pos,facade});
}
function business(x,z,name,kind,color){
 cube(scene,x,.13,z+2,49,.22,46,m.side,false);
 const mm=mat(color),height=kind==='hospital'?27:kind==='school'?20:16;
 cube(scene,x,height/2+.2,z-7,36,height,23,mm);addCollider(x,z-7,36,23);
 cube(scene,x,height+.4,z-7,37,.5,24,m.dark);
 cube(scene,x,2.9,z+4.65,7,5.5,.22,m.glass,false);
 for(let y=7;y<height-2;y+=4.5)for(const dx of [-13,-8,0,8,13])cube(scene,x+dx,y,z+4.75,2.5,2.3,.22,m.glass,false);
 cube(scene,x,height-1,z+5.1,17,2.0,.3,m.trim,false);
 businesses.push({name,kind,x,z,entry:new T.Vector3(x,0,z+13)});
}
const plots=[
['park','home','school','home','home','park'],
['home','home','police','home','hospital','home'],
['home','cafe','park','bank','home','home'],
['home','home','shop','park','fire','home'],
['home','home','gas','home','garage','home'],
['park','home','home','home','home','park']];
const shopInfo={school:['Szkoła','school',0xe4c47a],police:['Komisariat','police',0x7a9ec2],hospital:['Szpital','hospital',0xe2e7ee],cafe:['Kawiarnia','cafe',0xd9a582],shop:['Sklep','shop',0x91b2bf],garage:['Salon aut','garage',0x6c9c9c],bank:['Bank NEXO','bank',0x90acbd],fire:['Straż pożarna','fire',0xb77e79],gas:['Stacja paliw','gas',0xc5bfa6]};
let homeId=0;
for(let iz=0;iz<6;iz++)for(let ix=0;ix<6;ix++){
 const x=-150+ix*60,z=-150+iz*60;
 const type=plots[iz][ix];
 if(type==='home')home(x,z,++homeId);
 else if(type==='park'){cube(scene,x,.13,z,47,.22,47,mat(0x8bb97b),false);for(let q=0;q<9;q++){const a=q/9*Math.PI*2;plant(x+Math.cos(a)*16,z+Math.sin(a)*16,rr(.65,1))}cube(scene,x,.48,z,7,.7,7,mat(0xcbd8d4),false)}
 else{const data=shopInfo[type];business(x,z,...data)}
}

/* Public spaces: fountains, low-maintenance greenery, benches, plaza accents. */
const waterMaterial=new T.MeshPhysicalMaterial({color:0x59b7ca,metalness:.15,roughness:.18,transparent:true,opacity:.84,clearcoat:1});
const urban={curb:mat(0xbcc5c6),zebra:new T.MeshBasicMaterial({color:0xeceadf}),metal:mat(0x384958),red:mat(0xc85550),hedge:mat(0x477b50),sand:mat(0xd1c5a6),bench:mat(0x7d5d43)};
const stone=mat(0xd7d2c1),stoneDark=mat(0x9aabb2),flowers=[mat(0xf0ad80),mat(0xe4c1e8),mat(0xffdb79),mat(0xf4edef)];
function cylinder(x,y,z,top,bottom,height,material,segments=20,parent=scene){
 const o=new T.Mesh(new T.CylinderGeometry(top,bottom,height,segments),material);o.position.set(x,y,z);o.receiveShadow=true;parent.add(o);return o;
}
function parkFountain(x,z){
 cylinder(x,.5,z,5.65,5.85,.8,stone,30);
 cylinder(x,.95,z,5.15,5.2,.16,waterMaterial,32);
 cylinder(x,1.7,z,1.1,1.45,2.2,stone,16);
 cylinder(x,2.65,z,2.2,2.5,.35,stone,26);
 cylinder(x,2.88,z,1.85,1.85,.14,waterMaterial,30);
 cylinder(x,3.6,z,.25,.36,1.5,waterMaterial,12);
 addCollider(x,z,8,8);
 for(let d=0;d<4;d++){const a=d*Math.PI/2;bench(x+Math.sin(a)*10,z+Math.cos(a)*10,a+Math.PI)}
}
for(const [ix,iz] of [[2,2],[3,3]])parkFountain(-150+ix*60,-150+iz*60);
const flowerPositions=[];
for(let i=0;i<6;i++)for(let j=0;j<6;j++)if(plots[j][i]==='park'){
 const px=-150+i*60,pz=-150+j*60;
 for(let n=0;n<85;n++){
  const angle=random()*Math.PI*2,r=rr(8.5,22.5),x=px+Math.cos(angle)*r,z=pz+Math.sin(angle)*r;
  flowerPositions.push({x,z,scale:rr(.14,.36),type:Math.floor(rr(0,4))});
 }
}
const flowerMesh=new T.InstancedMesh(new T.IcosahedronGeometry(1,0),flowers[0],flowerPositions.length);
flowerMesh.instanceMatrix.setUsage(T.StaticDrawUsage);
const flowerDummy=new T.Object3D(),flowerColors=[0xf7bf8f,0xf1d3ec,0xffe381,0xffffff];
for(let i=0;i<flowerPositions.length;i++){
 const p=flowerPositions[i];
 flowerDummy.position.set(p.x,.35,p.z);flowerDummy.scale.setScalar(p.scale);flowerDummy.rotation.set(0,i*2.3,0);flowerDummy.updateMatrix();
 flowerMesh.setMatrixAt(i,flowerDummy.matrix);flowerMesh.setColorAt(i,new T.Color(flowerColors[p.type]));
}
flowerMesh.instanceMatrix.needsUpdate=true;scene.add(flowerMesh);
const decorativePlants=[];
for(const b of businesses){
 if(b.kind==='cafe'||b.kind==='shop'||b.kind==='bank'){
  for(const dx of [-14,14]){
   cylinder(b.x+dx,.57,b.z+9,1.1,.88,1.1,stoneDark,10);
   const shrub=new T.Mesh(new T.DodecahedronGeometry(1.5),m.tree);shrub.position.set(b.x+dx,1.9,b.z+9);shrub.castShadow=false;scene.add(shrub);
  }
 }
 if(b.kind==='cafe'){
  const awnMat=[mat(0xffeee1),mat(0xd07f64)];
  for(let v=0;v<10;v++)cube(scene,b.x-8+v*1.8,5.1,b.z+7,1.8,.24,4,awnMat[v%2],false);
  for(const dx of [-9,9])bench(b.x+dx,b.z+13,Math.PI/2);
 }
 if(b.kind==='garage'){
   for(let v=0;v<4;v++)cube(scene,b.x-13+v*8,2.3,b.z+5.22,6.6,3.8,.17,m.glass,false);
 }
}
for(let k=-3;k<=3;k++)for(let j=-3;j<=3;j++)if((k+j)%2===0)streetLight(k*60+10,j*60+10);

/* Architectural detailing, readable procedural signage and street infrastructure.
   Entirely generated in JS: no imported textures, models or images. */
const crossing=new T.InstancedMesh(new T.BoxGeometry(1.2,.025,3.3),urban.zebra,1250);
const temp=new T.Object3D();let ci=0;
for(let a=-3;a<=3;a++)for(let b=-3;b<=3;b++)for(const offset of [-9,9])for(let q=0;q<6;q++){
 temp.position.set(a*60+(q-2.5)*2,.12,b*60+offset);temp.rotation.set(0,0,0);temp.updateMatrix();crossing.setMatrixAt(ci++,temp.matrix);
 temp.position.set(a*60+offset,.12,b*60+(q-2.5)*2);temp.rotation.set(0,Math.PI/2,0);temp.updateMatrix();crossing.setMatrixAt(ci++,temp.matrix);
}
crossing.count=ci;crossing.instanceMatrix.needsUpdate=true;crossing.castShadow=false;scene.add(crossing);
function labelSign(text,x,y,z,w=13,h=2.8,background='#152b3e',foreground='#f3fafc'){
 const cv=document.createElement('canvas');cv.width=512;cv.height=128;const ctx=cv.getContext('2d');
 ctx.fillStyle=background;ctx.fillRect(0,0,512,128);
 ctx.fillStyle='#bbff74';ctx.fillRect(0,0,512,8);
 ctx.font='900 52px system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
 let label=String(text);while(ctx.measureText(label).width>470&&label.length>4)label=label.slice(0,-2)+'…';
 ctx.fillStyle=foreground;ctx.fillText(label,256,70);
 const texture=new T.CanvasTexture(cv);texture.colorSpace=T.SRGBColorSpace;
 const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture,side:T.DoubleSide}));
 o.position.set(x,y,z);scene.add(o);return o;
}
for(const h of homes){
 // Porch, front path, windowsill, garage and address plate
 cube(scene,h.x, .22,h.z+6.8,3.3,.2,8,urban.sand,false);
 cube(scene,h.x-7,1.65,h.z+3.1,3.1,3.1,.14,m.dark,false);
 cube(scene,h.x-7,1.65,h.z+3.22,2.8,2.8,.10,urban.metal,false);
 for(const dx of [-6,6])cube(scene,h.x+dx,3.2,h.z+3.18,3.35,.18,.32,m.trim,false);
 for(const side of [-1,1])for(let p=0;p<5;p++){
   cube(scene,h.x+side*16,.45,h.z-13+p*5, .65,.9,.65,urban.hedge,false);
 }
 labelSign(String(h.id).padStart(2,'0'),h.x-9,2.98,h.z+11.24,2.2,1.0,'#143c36','#d4ffaf');
}
for(const b of businesses){
 const height=b.kind==='hospital'?27:b.kind==='school'?20:16;
 labelSign(b.name.toUpperCase(),b.x,height-1.2,b.z+5.36,15,2.1);
 // Steps and front entrance
 cube(scene,b.x,.2,b.z+7,8,.24,5.5,urban.sand,false);
 cube(scene,b.x-4.25,2.1,b.z+4.9,.18,4.3,.25,urban.metal,false);
 cube(scene,b.x+4.25,2.1,b.z+4.9,.18,4.3,.25,urban.metal,false);
 if(b.kind==='police'){cube(scene,b.x,21,b.z-7,4,3,4,urban.metal);labelSign('POLICJA',b.x,12,b.z+5.6,13,1.8,'#224b75')}
 if(b.kind==='hospital'){const cross=mat(0xd74454);cube(scene,b.x,24,b.z+5.5,1.0,4,.3,cross,false);cube(scene,b.x,24,b.z+5.5,4,1,.32,cross,false)}
 if(b.kind==='fire'){cube(scene,b.x,2.5,b.z+5.0,11,4.3,.25,urban.red,false)}
 if(b.kind==='gas'){cube(scene,b.x,5.0,b.z+16,25,.7,12,urban.red,false);for(const dx of [-8,8])cube(scene,b.x+dx,2.5,b.z+16,.8,5,.8,urban.metal,false)}
}
function bench(x,z,rotation=0){
 const g=new T.Group();g.position.set(x,.4,z);g.rotation.y=rotation;scene.add(g);
 cube(g,0,.25,0,4,.3,1.2,urban.bench,false);
 cube(g,0,1.15,.45,4,1.6,.28,urban.bench,false);
 for(const xx of [-1.55,1.55])cube(g,xx,-.25,0,.25,1,.25,urban.metal,false);
}
for(const [ix,iz] of [[-3,-3],[-1,-1],[1,1],[2,-1],[-2,1]]){
 const x=ix*60+30,z=iz*60+30;
 for(const dx of [-9,9])bench(x+dx,z+9,Math.PI);
}
const lampPool=[];
for(let i=0;i<5;i++){const l=new T.PointLight(0xffce91,0,31,2);l.castShadow=false;scene.add(l);lampPool.push(l)}
function updateStreetLights(){
 if(!night||inside){for(const l of lampPool)l.intensity=0;lampGlass.emissiveIntensity=.55;return}
 lampGlass.emissiveIntensity=3.5;
 const origin=driving?car.root.position:playerPos;
 const near=streetLightSpots.map(p=>({p,d:(p[0]-origin.x)**2+(p[2]-origin.z)**2})).sort((a,b)=>a.d-b.d).slice(0,lampPool.length);
 for(let i=0;i<lampPool.length;i++){const l=lampPool[i],n=near[i];if(!n||n.d>6500){l.intensity=0;continue}l.position.set(...n.p);l.intensity=55}
}
const signals=[];
for(let a=-3;a<=3;a++)for(let b=-3;b<=3;b++)if((a+b)%2===0){
 for(const [dx,dz] of [[10,10],[-10,-10]]){
  const g=new T.Group();g.position.set(a*60+dx,0,b*60+dz);scene.add(g);
  cube(g,0,3.5,0,.22,7,.22,urban.metal,false);
  cube(g,0,6.65,0,.83,2.25,.73,m.dark,false);
  for(const [i,c] of [0xcc4141,0xe3a13b,0x65e87b].entries()){
   const bulb=new T.Mesh(new T.SphereGeometry(.24,10,8),new T.MeshBasicMaterial({color:c}));
   bulb.position.set(0,7.25-i*.62,.42);g.add(bulb);signals.push({bulb,i,offset:a+b});
  }
 }
}
const cloudMaterial=new T.MeshBasicMaterial({color:0xf6fbff,transparent:true,opacity:.56,depthWrite:false});
const clouds=[];
for(let i=0;i<13;i++){
 const g=new T.Group();g.position.set(rr(-170,170),rr(81,110),rr(-170,170));scene.add(g);
 const puffGeom=new T.SphereGeometry(1,9,7);
 for(let k=0;k<4;k++){const mesh=new T.Mesh(puffGeom,cloudMaterial);mesh.position.set((k-1.5)*7,rr(-2,2),rr(-4,4));mesh.scale.set(rr(9,14),rr(3,5),rr(5,8));g.add(mesh)}
 clouds.push(g);
}
const indoor=new T.Group();scene.add(indoor);indoor.position.set(0,0,620);
const floor=mat(0xbab5aa),walls=mat(0xf0e7d8),couch=mat(0x5c8a9d),rug=mat(0x9cbbc0);
cube(indoor,0,-.1,0,26,.25,26,floor);
cube(indoor,-13,5,0,.4,10,26,walls);cube(indoor,13,5,0,.4,10,26,walls);cube(indoor,0,5,-13,26,10,.4,walls);cube(indoor,0,5,13,26,10,.4,walls);
cube(indoor,0,.08,-2,12,.11,9,rug,false);cube(indoor,0,1.1,-6,9,1.4,3.6,couch);
cube(indoor,0,1.7,-7.4,9,1.5,.55,couch);cube(indoor,0,.6,1,4.3,1.1,2.4,m.wood);
cube(indoor,-8,2,-8,3,4,3,m.wood);cube(indoor,9,2.2,-9,3,4.2,3,m.trim);
cube(indoor,0,3,12.6,3,6,.28,m.wood,false);
// Furnished bedroom, kitchen and dining area – procedural meshes only
cube(indoor,-7,.55,5,6,1.1,8,m.wood,false);
cube(indoor,-7,1.17,5,5.5,.5,7.2,mat(0xe6ebe7),false);
cube(indoor,-7,1.47,1.95,4.9,.22,1.7,mat(0x9dbbd7),false);
for(const kz of [-9,-5,-1])cube(indoor,10,1,kz,4,2.0,2.4,m.wood,false);
cube(indoor,10,2.08,-5,4.5,.22,10,mat(0xd1d6d6),false);
cube(indoor,9,3,-9.45,2.4,1.1,.2,m.dark,false);
cube(indoor,6,.75,7,4.5,1.5,3.8,m.wood,false);
for(const p of [-1.7,1.7])cube(indoor,6+p,.6,10,1,.7,1.2,mat(0x777a74),false);
cube(indoor,0,4.1,-12.4,6,3.6,.35,m.dark,false);
const screen=new T.MeshBasicMaterial({color:0x36748b});cube(indoor,0,4.1,-12.15,5.5,3.1,.12,screen,false);
const indoorLight=new T.PointLight(0xffedcf,100,40);indoorLight.position.set(0,7,0);indoor.add(indoorLight);
const clothes=[0x8bdeff,0xf9a7af,0xa9ff86,0xdfbbff,0xffcd7b,0xffffff,0x454d6d];
const skin=mat(0xf0c39b),hair=mat(0x342a29),pants=mat(0x293b52),shoes=mat(0x202b37);
const avatar=new T.Group(),torso=mat(clothes[0]),head=new T.Group();scene.add(avatar);
cube(avatar,0,1.75,0,1.45,1.8,.75,torso);cube(avatar,0,.55,-.04,1.25,1.0,.68,pants);
cube(avatar,-.39,.15,-.04,.46,.55,.57,shoes);cube(avatar,.39,.15,-.04,.46,.55,.57,shoes);
const leftArm=cube(avatar,-1,1.7,0,.45,1.6,.48,torso);const rightArm=cube(avatar,1,1.7,0,.45,1.6,.48,torso);
cube(avatar,0,3,.0,1.13,1.1,1.03,skin);cube(avatar,0,3.54,-.08,1.2,.3,1.1,hair);
for(const x of [-.27,.27])cube(avatar,x,3.13,-.53,.15,.12,.07,m.dark,false);
const legs=[...avatar.children].filter(a=>a.position.y<.23&&a!==leftArm&&a!==rightArm);
avatar.castShadow=true;
function carModel(color){
 const grp=new T.Group();
 const coat=new T.MeshPhysicalMaterial({color,metalness:.31,roughness:.27,clearcoat:.85,clearcoatRoughness:.18});
 const black=mat(0x15212b,.46),tire=mat(0x151b22,.92),rim=mat(0xa7afb8,.37),darkGlass=new T.MeshPhysicalMaterial({color:0x628ba2,metalness:.12,roughness:.14,transparent:true,opacity:.79,clearcoat:1});
 const light=new T.MeshStandardMaterial({color:0xfff5d2,emissive:0xffe8b3,emissiveIntensity:1.35});
 const tail=new T.MeshStandardMaterial({color:0xd53344,emissive:0xc6262f,emissiveIntensity:.48});
 cube(grp,0,.93,0,3.86,.84,6.78,coat);
 cube(grp,0,.57,0,3.74,.21,6.57,black,false);
 cube(grp,0,1.46,-1.92,3.58,.28,2.5,coat,false);
 cube(grp,0,1.47,2.39,3.56,.26,1.6,coat,false);
 cube(grp,0,2.17,.53,3.1,.22,3.23,coat);
 cube(grp,0,1.88,.46,3.04,.8,3.13,darkGlass,false);
 cube(grp,0,2.35,.49,2.93,.20,2.84,coat,false);
 for(const side of [-1,1]){
  cube(grp,side*1.74,1.44,.12,.1,.07,5.42,black,false);
  cube(grp,side*1.63,2.06,.32,.10,.67,2.9,darkGlass,false);
  cube(grp,side*1.95,1.74,-1.10,.60,.32,.38,black,false);
  cube(grp,side*2.06,1.72,-1.2,.30,.17,.26,darkGlass,false);
  for(const z of [-1.1,1.26])cube(grp,side*1.94,1.38,z,.13,.075,.43,rim,false);
  for(const z of [-2.14,2.12]){
   const wheel=new T.Mesh(new T.CylinderGeometry(.73,.73,.57,16),tire);
   wheel.rotation.z=Math.PI/2;wheel.position.set(side*2.02,.75,z);wheel.castShadow=true;grp.add(wheel);
   const hub=new T.Mesh(new T.CylinderGeometry(.38,.38,.60,12),rim);
   hub.rotation.z=Math.PI/2;hub.position.set(side*2.025,.75,z);grp.add(hub);
   const center=new T.Mesh(new T.CylinderGeometry(.18,.18,.64,10),black);
   center.rotation.z=Math.PI/2;center.position.set(side*2.027,.75,z);grp.add(center);
  }
  cube(grp,side*1.21,1.2,-3.43,.82,.40,.14,light,false);
  cube(grp,side*1.25,1.21,3.43,.79,.32,.13,tail,false);
 }
 cube(grp,0,.81,-3.5,2.4,.36,.14,black,false);
 for(let a=-1;a<=1;a++)cube(grp,0,.73+a*.14,-3.58,1.94,.045,.055,rim,false);
 cube(grp,0,.61,-3.53,.8,.29,.12,rim,false);
 cube(grp,0,.65,3.54,1.3,.22,.12,rim,false);
 cube(grp,0,.3,-2.8,2.1,.24,.5,black,false);
 return{root:grp,coat};
}
let save={cash:2500,job:'Mieszkaniec',color:0,house:0,delivery:0,rpName:'Gracz',bio:'Nowy mieszkaniec NEXO CITY',skin:0,hair:0,vehicle:0,prop:'none',pet:'none',locked:false,homeColor:0,weather:'clear',quality:'auto'};
try{const data=JSON.parse(localStorage.getItem('nexo-life-rp-alpha2')||'{}');if(data&&typeof data==='object')Object.assign(save,{cash:Number(data.cash)||2500,job:typeof data.job==='string'?data.job:'Mieszkaniec',color:Math.max(0,Number(data.color)||0)%clothes.length,house:Number(data.house)||0,delivery:Math.min(4,Math.max(0,Number(data.delivery)||0)),rpName:typeof data.rpName==='string'?data.rpName.slice(0,24):'Gracz',bio:typeof data.bio==='string'?data.bio.slice(0,80):'Nowy mieszkaniec NEXO CITY',skin:Math.max(0,Number(data.skin)||0)%5,hair:Math.max(0,Number(data.hair)||0)%5,vehicle:Math.max(0,Number(data.vehicle)||0)%4,prop:typeof data.prop==='string'?data.prop:'none',pet:typeof data.pet==='string'?data.pet:'none',locked:!!data.locked,homeColor:Math.max(0,Number(data.homeColor)||0)%5,weather:['clear','rain','fog'].includes(data.weather)?data.weather:'clear',quality:['auto','fast','ultra'].includes(data.quality)?data.quality:'auto'})}catch{}
const skinColors=[0xf0c39b,0xf9d8bc,0xb98462,0x80543e,0xc7a68c],hairColors=[0x342a29,0xe5bd76,0x644734,0x1a2430,0xb5543d];
torso.color.setHex(clothes[save.color]);skin.color.setHex(skinColors[save.skin]);hair.color.setHex(hairColors[save.hair]);
function persist(){try{localStorage.setItem('nexo-life-rp-alpha2',JSON.stringify(save))}catch{}}
function setQuality(value){
 save.quality=value;persist();
 const mobile=matchMedia('(pointer:coarse)').matches;
 const dpr=value==='fast'?.75:value==='ultra'?Math.min(devicePixelRatio||1,2):Math.min(devicePixelRatio||1,mobile?1:1.5);
 renderer.setPixelRatio(dpr);renderer.setSize(innerWidth,innerHeight);
 sun.castShadow=value!=='fast';
 renderer.shadowMap.enabled=value!=='fast';
 renderer.shadowMap.needsUpdate=true;
}
setQuality(save.quality);
let car=carModel(0xa6e7fc);car.root.position.set(6,0,-12);scene.add(car.root);
const vehicleModels=[{name:'City Cruiser',speed:36,color:0xa6e7fc},{name:'Family SUV',speed:30,color:0xe0d6bd},{name:'Street Sport',speed:47,color:0xd95765},{name:'Police Unit',speed:42,color:0xe2e8ee}];
function replaceVehicle(type){
 const v=vehicleModels[type]||vehicleModels[0],old=car.root,oldPos=old.position.clone(),oldYaw=old.rotation.y;
 scene.remove(old);old.traverse(obj=>{if(obj.isMesh)obj.geometry.dispose()});
 car=carModel(v.color);scene.add(car.root);car.root.position.copy(oldPos);car.root.rotation.y=oldYaw;
 if(type===1){car.root.scale.set(1.08,1.24,1.08);cube(car.root,0,2.7,.4,2.8,.25,3,m.dark,false);for(const x of [-1.25,1.25])cube(car.root,x,2.98,.45,.22,.2,3.5,m.dark,false)}
 if(type===2){car.root.scale.set(1.04,.86,1.08);cube(car.root,0,1.75,3.36,3.2,.22,.85,car.coat,false)}
 if(type===3){cube(car.root,-.65,2.55,-.15,1.1,.35,.75,mat(0xd83142),false);cube(car.root,.65,2.55,-.15,1.1,.35,.75,mat(0x2c7fd6),false)}
 save.vehicle=type;persist();
}
replaceVehicle(save.vehicle);
for(let i=0;i<15;i++){const model=carModel([0xeecc70,0xec998a,0xb3d2d6,0xbca5f0,0xa5d7a9][Math.floor(rr(0,5))]);model.root.scale.setScalar(.78);scene.add(model.root);traffic.push({model,vertical:random()>.5,lane:Math.floor(rr(-3,4))*60+(random()>.5?3.2:-3.2),t:rr(-185,185),dir:random()>.5?1:-1,speed:rr(7,14)})}
const npc=[];
for(let i=0;i<13;i++){
 const g=new T.Group(),shirt=mat(clothes[i%clothes.length]),face=mat(skinColors[Math.floor(rr(0,skinColors.length))]);
 cube(g,0,1.62,0,.87,1.3,.68,shirt,false);
 const h=new T.Mesh(new T.SphereGeometry(.44,11,9),face);h.position.set(0,2.63,-.03);g.add(h);
 cube(g,0,3,-.03,.86,.22,.8,mat(hairColors[Math.floor(rr(0,hairColors.length))]),false);
 cube(g,-.59,1.58,0,.3,1.18,.33,shirt,false);cube(g,.59,1.58,0,.3,1.18,.33,shirt,false);
 const l=cube(g,-.24,.45,0,.31,.88,.4,pants,false),r=cube(g,.24,.45,0,.31,.88,.4,pants,false);
 scene.add(g);const px=[-30,90,30,-90][i%4],pz=[-30,30,-90,90][Math.floor(i/4)%4];
 npc.push({g,x:px,z:pz,seed:rr(0,20),l,r})
}
let playerPos=new T.Vector3(8,0,19),charYaw=0,carYaw=0,carSpeed=0,driving=false,inside=false,night=false,started=false,paused=true,highView=false,activePage=null,exitPosition=null,payTick=0,stepTime=0,uiTick=0;
const esc=text=>String(text).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let emote='none',emoteClock=0,weather=save.weather;
const propHolder=new T.Group();propHolder.position.set(0,-.75,-.15);rightArm.add(propHolder);
const propMats={pink:mat(0xf59bbc),blue:mat(0x6fbddd),gold:mat(0xe3c86f)};
function equipProp(name){
 while(propHolder.children.length){const c=propHolder.children[0];propHolder.remove(c);c.traverse(o=>{if(o.geometry)o.geometry.dispose()})}
 const handle=mat(0x3f4b56),plastic=mat(0x8d929c);
 if(name==='flashlight'){
  const body=new T.Mesh(new T.CylinderGeometry(.16,.20,.8,9),handle);body.rotation.x=Math.PI/2;propHolder.add(body);
  cube(propHolder,0,0,-.46,.35,.35,.25,propMats.gold,false);
  const light=new T.SpotLight(0xfff0c5,18,22,.38,.45,1);light.position.set(0,0,-.4);light.target.position.set(0,0,-4);propHolder.add(light,light.target);
 }else if(name==='balloon'){
  const string=new T.Mesh(new T.CylinderGeometry(.02,.02,3.5,6),plastic);string.position.y=1.8;propHolder.add(string);
  const balloon=new T.Mesh(new T.SphereGeometry(.8,12,10),propMats.pink);balloon.scale.set(.9,1.2,.9);balloon.position.y=4;propHolder.add(balloon);
 }else if(name==='coffee'){
  const cup=new T.Mesh(new T.CylinderGeometry(.3,.24,.65,12),propMats.blue);propHolder.add(cup);cube(propHolder,0,.38,0,.6,.06,.6,m.white,false);
 }else if(name==='phone'){
  cube(propHolder,0,0,-.2,.45,.8,.11,m.dark,false);cube(propHolder,0,0,-.29,.38,.65,.05,propMats.blue,false);
 }else if(name==='umbrella'){
  const stick=new T.Mesh(new T.CylinderGeometry(.055,.055,3.6,6),handle);stick.position.y=1.6;propHolder.add(stick);
  const top=new T.Mesh(new T.ConeGeometry(2.2,1,12),propMats.blue);top.position.y=3.8;propHolder.add(top);
 }
 save.prop=name;persist();
}
equipProp(save.prop);
const petGroup=new T.Group();scene.add(petGroup);
function buildPet(kind){
 while(petGroup.children.length){const child=petGroup.children[0];petGroup.remove(child);child.traverse(o=>{if(o.geometry)o.geometry.dispose()})}
 petGroup.visible=kind!=='none';if(kind==='none')return;
 const coat=mat(kind==='dog'?0xa7774e:0xa5acba),dark=mat(0x303334);
 cube(petGroup,0,.65,0,.8,.8,1.4,coat,false);cube(petGroup,0,1.2,-.68,.72,.72,.72,coat,false);
 for(const x of [-.27,.27])for(const z of [-.48,.47])cube(petGroup,x,.18,z,.23,.4,.24,coat,false);
 for(const x of [-.25,.25])cube(petGroup,x,1.32,-1.08,.1,.1,.11,dark,false);
 cube(petGroup,0,1.13,-1.1,.14,.12,.1,dark,false);
 cube(petGroup,0,1.05,1.04,.16,.18,.7,coat,false).rotation.x=-.45;
}
buildPet(save.pet);petGroup.position.set(8,0,23);
function animateRoleplay(dt){
 if(driving){avatar.visible=false;petGroup.visible=false;return}
 avatar.visible=true;petGroup.visible=save.pet!=='none';
 const to=playerPos.clone().add(new T.Vector3(Math.sin(charYaw)*2.8,0,Math.cos(charYaw)*2.8));
 petGroup.position.lerp(to,Math.min(1,dt*3.3));petGroup.rotation.y=charYaw;
 const walking=key.has('forward')||key.has('back')||key.has('left')||key.has('right');
 if(emote!=='none'&&walking)emote='none';
 if(emote==='wave'){emoteClock+=dt;rightArm.rotation.z=-2.2;rightArm.rotation.x=Math.sin(emoteClock*9)*.5}
 if(emote==='dance'){emoteClock+=dt;avatar.rotation.z=Math.sin(emoteClock*8)*.18;leftArm.rotation.x=Math.sin(emoteClock*7);rightArm.rotation.x=-Math.sin(emoteClock*7)}
 if(emote==='sit'){avatar.position.y=-.5;leftArm.rotation.x=-.25;rightArm.rotation.x=-.25}
 if(emote==='none'){avatar.rotation.z*=.7;rightArm.rotation.z*=.65}
 if(emote!=='sit')avatar.position.y=0;
}
const weatherPositions=new Float32Array(330*3);
for(let i=0;i<330;i++){weatherPositions[i*3]=(Math.random()-.5)*100;weatherPositions[i*3+1]=Math.random()*44;weatherPositions[i*3+2]=(Math.random()-.5)*100}
const rainGeo=new T.BufferGeometry();rainGeo.setAttribute('position',new T.BufferAttribute(weatherPositions,3));
const rainCloud=new T.Points(rainGeo,new T.PointsMaterial({color:0xc5e7ff,size:.18,transparent:true,opacity:.76,depthWrite:false}));scene.add(rainCloud);
function applyAtmosphere(){
 const foggy=weather==='fog',raining=weather==='rain';
 const bg=night?(foggy?0x263546:0x172a45):foggy?0x8e9da6:raining?0x829fb8:0x93ccf5;
 scene.background.setHex(bg);scene.fog.color.setHex(bg);scene.fog.near=foggy?40:raining?85:125;scene.fog.far=foggy?215:raining?315:380;
 amb.intensity=night?.7:raining?1.4:2.1;sun.intensity=night?.4:raining?1.3:2.65;renderer.toneMappingExposure=night?1.04:1.3;
 rainCloud.visible=raining;m.road.roughness=raining?.31:.8;m.road.needsUpdate=true;skyShader.uniforms.uNight.value=night?1:0;
}
applyAtmosphere();
function animateWeather(dt){
 rainCloud.visible=weather==='rain'&&!inside;
 if(rainCloud.visible){rainCloud.position.set(playerPos.x,0,playerPos.z);
  for(let i=0;i<330;i++){const a=i*3;weatherPositions[a+1]-=dt*32;if(weatherPositions[a+1]<0){weatherPositions[a+1]=44;weatherPositions[a]=(Math.random()-.5)*100;weatherPositions[a+2]=(Math.random()-.5)*100}}
  rainGeo.attributes.position.needsUpdate=true;
 }
 for(const c of clouds){c.position.x+=dt*.45;if(c.position.x>205)c.position.x=-205}
 for(const o of signals){const phase=(Math.floor(clock.elapsedTime/7+o.offset*.3)%3+3)%3;o.bulb.material.color.setHex(phase===o.i?[0xff6864,0xffd166,0x79ff88][o.i]:[0x4c2729,0x5c4f2b,0x24492f][o.i])}
}
function showToast(txt){const e=el('toast');e.textContent=txt;e.classList.add('on');clearTimeout(showToast.id);showToast.id=setTimeout(()=>e.classList.remove('on'),2400)}
let orbitYaw=0,orbitLift=0,cameraDistance=1,dragPointer=null,lastPointerX=0,lastPointerY=0,photoMode=false;
const surface=el('world');
surface.addEventListener('pointerdown',e=>{
 if(!started||paused)return;
 if(e.pointerType==='mouse'&&e.button!==0)return;
 dragPointer=e.pointerId;lastPointerX=e.clientX;lastPointerY=e.clientY;surface.setPointerCapture(e.pointerId);
});
surface.addEventListener('pointermove',e=>{
 if(dragPointer!==e.pointerId)return;
 const dx=e.clientX-lastPointerX,dy=e.clientY-lastPointerY;
 lastPointerX=e.clientX;lastPointerY=e.clientY;
 orbitYaw=Math.max(-Math.PI,Math.min(Math.PI,orbitYaw-dx*.005));
 orbitLift=Math.max(-5,Math.min(16,orbitLift+dy*.045));
});
for(const event of ['pointerup','pointercancel','lostpointercapture'])surface.addEventListener(event,e=>{if(e.pointerId===dragPointer)dragPointer=null});
surface.addEventListener('wheel',e=>{if(!started)return;e.preventDefault();cameraDistance=Math.max(.6,Math.min(1.7,cameraDistance+e.deltaY*.0009))},{passive:false});
function togglePhoto(){
 if(!started)return;
 photoMode=!photoMode;
 document.querySelector('.hud').classList.toggle('photo',photoMode);
 el('photoExit').classList.toggle('visible',photoMode);
 if(photoMode)key.clear();
}
el('photo').onclick=togglePhoto;
el('photoExit').onclick=togglePhoto;
const key=new Set(),mapped={w:'forward',arrowup:'forward',s:'back',arrowdown:'back',a:'left',arrowleft:'left',d:'right',arrowright:'right',shift:'run'};
document.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(mapped[k]){key.add(mapped[k]);e.preventDefault()}if(e.repeat)return;if(photoMode){if(k==='o'||k==='escape')togglePhoto();return}if(k==='o')togglePhoto();if(k==='e')interact();if(k==='f')togglePanel('phone');if(k==='h')honk();if(k==='c'){highView=!highView;showToast(highView?'Kamera z góry':'Kamera zza pleców')}if(k==='p'||k==='escape')togglePause()});
document.addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(mapped[k])key.delete(mapped[k])});W.addEventListener('blur',()=>key.clear());
document.querySelectorAll('[data-control]').forEach(b=>{const action=b.dataset.control;b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);key.add(action);b.classList.add('down')});for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>{key.delete(action);b.classList.remove('down')})});
document.querySelectorAll('[data-shortcut]').forEach(b=>b.addEventListener('click',()=>{const action=b.dataset.shortcut;if(action==='interact')interact();if(action==='phone')togglePanel('phone');if(action==='camera'){highView=!highView;showToast('Zmieniono kamerę')}if(action==='honk')honk()}));
let soundEnabled=true,audioCtx=null,engineOsc=null,engineGain=null;
function initAudio(){
 if(!soundEnabled)return;
 if(!audioCtx){
  const Audio=W.AudioContext||W.webkitAudioContext;if(!Audio)return;
  audioCtx=new Audio();
  engineOsc=audioCtx.createOscillator();engineGain=audioCtx.createGain();
  engineOsc.type='sawtooth';engineOsc.frequency.value=45;engineGain.gain.value=0;
  const filter=audioCtx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=180;
  engineOsc.connect(filter);filter.connect(engineGain);engineGain.connect(audioCtx.destination);engineOsc.start();
 }
 if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});
}
function honk(){
 if(!started||paused||!driving||!soundEnabled)return;
 initAudio();if(!audioCtx)return;
 const t=audioCtx.currentTime;
 for(const pitch of [325,405]){
  const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();
  osc.type='square';osc.frequency.value=pitch;
  gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(.032,t+.03);gain.gain.exponentialRampToValueAtTime(.0001,t+.32);
  osc.connect(gain);gain.connect(audioCtx.destination);osc.start(t);osc.stop(t+.34);
 }
}
function updateAudio(){
 if(!audioCtx||!engineOsc||!engineGain)return;
 const time=audioCtx.currentTime;
 engineOsc.frequency.setTargetAtTime(44+Math.abs(carSpeed)*3.7,time,.09);
 engineGain.gain.setTargetAtTime(soundEnabled&&started&&!paused&&driving?.024+Math.abs(carSpeed)*.0005:0,time,.08);
}
el('sound').onclick=()=>{soundEnabled=!soundEnabled;el('sound').textContent=soundEnabled?'🔊':'🔇';if(soundEnabled)initAudio();showToast(soundEnabled?'Dźwięk włączony':'Dźwięk wyłączony')};
function togglePause(){if(!started)return;paused=!paused;el('pause').textContent=paused?'▶':'Ⅱ';showToast(paused?'Pauza':'Wracamy do miasta!')}
el('pause').onclick=togglePause;
el('startBtn').onclick=()=>{started=true;paused=false;initAudio();el('start').classList.add('hidden');showToast('Witaj w NEXO LIFE RP!')}
el('day').onclick=()=>{night=!night;applyAtmosphere();el('day').textContent=night?'☾ NOC':'☀ DZIEŃ';showToast(night?'Zapadła noc':'Nastał dzień')};
function togglePanel(p){if(activePage===p){activePage=null;el('panel').classList.remove('visible')}else{activePage=p;renderPanel()}document.querySelectorAll('[data-page]').forEach(e=>e.classList.toggle('active',e.dataset.page===activePage))}
document.querySelectorAll('[data-page]').forEach(e=>e.onclick=()=>togglePanel(e.dataset.page));
function pageText(){if(activePage==='phone')return {title:'📱 NEXO PHONE',lead:'Twoje miasto w kieszeni. Wybierz, co chcesz robić.',body:[
 ['avatar','👤 Postać','Wygląd i styl'],['cars','🚘 Garaż','Cztery modele samochodów'],
 ['homes','🏠 Dom','Twój dom i jego ustawienia'],['jobs','💼 Praca','Wybierz swój zawód'],
 ['rp','🎭 Roleplay','Imię, biografia i emotki'],['bag','🎒 Plecak','Przedmioty i zwierzęta'],['weather','🌦 Pogoda','Słońce, deszcz lub mgła'],['settings','⚙️ Ustawienia','Jakość grafiki i kamera']
 ].map(x=>'<div class="option"><div><b>'+x[1]+'</b><small>'+x[2]+'</small></div><button data-open="'+x[0]+'">OTWÓRZ</button></div>').join('')};
if(activePage==='avatar')return{title:'👤 KREATOR POSTACI',lead:'Personalizuj swój wygląd. Wszystkie elementy postaci powstają z kodu.',body:
 '<div class="panel-caption">STRÓJ</div><div class="swatches">'+clothes.map((c,i)=>'<button class="swatch '+(save.color===i?'selected':'')+'" style="background:#'+c.toString(16).padStart(6,'0')+'" data-color="'+i+'" aria-label="Strój '+i+'"></button>').join('')+'</div>'+
 '<div class="panel-caption">KOLOR SKÓRY</div><div class="swatches">'+skinColors.map((c,i)=>'<button class="swatch '+(save.skin===i?'selected':'')+'" style="background:#'+c.toString(16).padStart(6,'0')+'" data-skin="'+i+'" aria-label="Skóra '+i+'"></button>').join('')+'</div>'+
 '<div class="panel-caption">KOLOR WŁOSÓW</div><div class="swatches">'+hairColors.map((c,i)=>'<button class="swatch '+(save.hair===i?'selected':'')+'" style="background:#'+c.toString(16).padStart(6,'0')+'" data-hair="'+i+'" aria-label="Włosy '+i+'"></button>').join('')+'</div>'};
if(activePage==='cars')return{title:'🚘 TWÓJ GARAŻ',lead:'Wybierz pojazd, przywołaj go na najbliższą ulicę i wsiądź klawiszem E.',body:vehicleModels.map((v,i)=>'<div class="option"><div><b>'+['🚙','🚘','🏎️','🚓'][i]+' '+v.name+'</b><small>Maks. prędkość: '+Math.round(v.speed*3.2)+' km/h</small></div><button data-spawn="'+i+'">'+(save.vehicle===i?'PRZYWOŁAJ':'WYBIERZ')+'</button></div>').join('')+
 '<div class="option"><div><b>🎨 Kolor karoserii</b><small>Losowy nowy lakier</small></div><button data-paint="1">ZMIANA</button></div>'};
if(activePage==='homes')return{title:'🏠 TWOJA NIERUCHOMOŚĆ',lead:'Podejdź do domu z numerem i wciśnij E, żeby go zająć. Każdy dom ma wnętrze.',body:
 '<div class="option"><div><b>🏡 Mój dom</b><small>'+(save.house?'Numer '+save.house:'Nie zajęto domu')+'</small></div><button data-home="1" '+(save.house?'':'disabled')+'>IDŹ DO DOMU</button></div>'+
 '<div class="option"><div><b>'+(save.locked?'🔒 Drzwi zamknięte':'🔓 Drzwi otwarte')+'</b><small>Ustawienie RP (tryb jednoosobowy)</small></div><button data-lock="1" '+(!save.house?'disabled':'')+'>'+(save.locked?'OTWÓRZ':'ZAMKNIJ')+'</button></div>'+
 '<div class="option"><div><b>🎨 Elewacja domu</b><small>Wybierz następny kolor domu</small></div><button data-homecolor="1" '+(!save.house?'disabled':'')+'>ZMIEŃ</button></div>'};
if(activePage==='jobs')return{title:'💼 ZNAJDŹ PRACĘ',lead:'Wybierz zawód i zarabiaj podczas gry. Dostawy to dodatkowe wynagrodzenie.',body:['Mieszkaniec','Kurier','Policjant','Lekarz','Strażak','Sprzedawca','Nauczyciel','Mechanik','Kierowca','Reporter'].map(name=>'<div class="option"><div><b>'+name+'</b><small>'+(name==='Mieszkaniec'?'Swobodna rozgrywka':name==='Kurier'?'Zarabiaj dodatkowo na dostawach':'Wypłata co 60 sekund')+'</small></div><button data-job="'+name+'" '+(save.job===name?'disabled':'')+'>'+(save.job===name?'WYBRANO':'WYBIERZ')+'</button></div>').join('')};
if(activePage==='rp')return{title:'🎭 ROLEPLAY',lead:'Ustaw imię postaci, swoją historię i wykonuj emotki.',body:
 '<div class="panel-caption">TWOJE IMIĘ RP</div><input class="rp-field" id="rpName" maxlength="24" value="'+esc(save.rpName)+'" placeholder="Imię postaci">'+
 '<div class="panel-caption">TWOJA HISTORIA</div><input class="rp-field" id="rpBio" maxlength="80" value="'+esc(save.bio)+'" placeholder="Kim jest Twoja postać?">'+
 '<button class="fullbtn" data-saveprofile="1">ZAPISZ PROFIL</button>'+
 '<div class="panel-caption">EMOTKI I GESTY</div>'+
 [['wave','👋 Pomachaj'],['dance','💃 Zatańcz'],['sit','🪑 Usiądź'],['none','🧍 Wstań']].map(x=>'<div class="option"><b>'+x[1]+'</b><button data-emote="'+x[0]+'">WYKONAJ</button></div>').join('')};
if(activePage==='bag')return{title:'🎒 PLECAK I PUPIL',lead:'Wybierz przedmiot do ręki albo zwierzaka, który będzie za Tobą chodził.',body:
 '<div class="panel-caption">PRZEDMIOTY</div>'+
 [['none','✋ Puste ręce'],['phone','📱 Telefon'],['flashlight','🔦 Latarka'],['coffee','☕ Kawa'],['umbrella','☂️ Parasol'],['balloon','🎈 Balon']].map(x=>'<div class="option"><b>'+x[1]+'</b><button data-prop="'+x[0]+'" '+(save.prop===x[0]?'disabled':'')+'>'+(save.prop===x[0]?'WYBRANO':'WEŹ')+'</button></div>').join('')+
 '<div class="panel-caption">ZWIERZĘTA</div>'+
 [['none','Bez zwierzaka'],['dog','🐶 Pies'],['cat','🐱 Kot']].map(x=>'<div class="option"><b>'+x[1]+'</b><button data-pet="'+x[0]+'" '+(save.pet===x[0]?'disabled':'')+'>'+(save.pet===x[0]?'WYBRANO':'WYBIERZ')+'</button></div>').join('')};
if(activePage==='settings')return{title:'⚙️ GRAFIKA I KAMERA',lead:'Dostosuj jakość obrazu do swojego sprzętu. Ustawienia zapisują się automatycznie.',body:
 '<div class="panel-caption">JAKOŚĆ GRAFIKI</div>'+
 [['fast','⚡ Wydajność','Mniej efektów dla słabszych telefonów'],['auto','✨ Zrównoważona','Dostosowana do urządzenia'],['ultra','💎 Ultra','Ostrzejsza grafika i cienie']].map(x=>'<div class="option"><div><b>'+x[1]+'</b><small>'+x[2]+'</small></div><button data-quality="'+x[0]+'" '+(save.quality===x[0]?'disabled':'')+'>'+(save.quality===x[0]?'AKTYWNA':'USTAW')+'</button></div>').join('')+
 '<div class="option"><div><b>📷 Tryb fotograficzny</b><small>Ukryj HUD i zrób zdjęcie świata</small></div><button data-photo="1">WŁĄCZ</button></div>'+ '<p class="panel-lead">Przeciągnij palcem lub myszą po świecie, aby obracać kamerę. Kółkiem myszy zmieniaj przybliżenie. Klawisz O uruchamia tryb fotograficzny.</p>'};
if(activePage==='weather')return{title:'🌦 POGODA I ATMOSFERA',lead:'Zmiana pogody wpływa na widoczność i wygląd miasta.',body:
 [['clear','☀️ Słonecznie','Jasne niebo i dobra widoczność'],['rain','🌧️ Deszcz','Opady i mokra nawierzchnia'],['fog','🌫️ Mgła','Ograniczona widoczność']].map(x=>'<div class="option"><div><b>'+x[1]+'</b><small>'+x[2]+'</small></div><button data-weather="'+x[0]+'" '+(weather===x[0]?'disabled':'')+'>'+(weather===x[0]?'WYBRANO':'USTAW')+'</button></div>').join('')};
return{title:'NEXO LIFE RP',lead:'',body:''}
}
function renderPanel(){const data=pageText(),p=el('panel');p.innerHTML='<div class="panel-head"><h2>'+data.title+'</h2><button data-close="1">✕</button></div><p class="panel-lead">'+data.lead+'</p>'+data.body;p.classList.add('visible')}
el('panel').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
if(b.dataset.close)togglePanel(activePage);
if(b.dataset.open){activePage=b.dataset.open;renderPanel();document.querySelectorAll('[data-page]').forEach(e=>e.classList.toggle('active',e.dataset.page===activePage))}
if(b.dataset.color!==undefined){save.color=Number(b.dataset.color);torso.color.setHex(clothes[save.color]);persist();renderPanel();showToast('Zmieniono styl postaci!')}
if(b.dataset.job){save.job=b.dataset.job;persist();renderPanel();updateHud();showToast('Nowa praca: '+save.job)}
if(b.dataset.paint){car.coat.color.setHex([0xa6e7fc,0xf49aab,0xb4ff91,0xe0c2ff,0xf4db90][Math.floor(rr(0,5))]);showToast('Zmieniono lakier')}
if(b.dataset.skin!==undefined){save.skin=Number(b.dataset.skin);skin.color.setHex(skinColors[save.skin]);persist();renderPanel();showToast('Zmieniono wygląd postaci')}
if(b.dataset.hair!==undefined){save.hair=Number(b.dataset.hair);hair.color.setHex(hairColors[save.hair]);persist();renderPanel();showToast('Zmieniono kolor włosów')}
if(b.dataset.prop!==undefined){equipProp(b.dataset.prop);renderPanel();showToast('Przedmiot w ekwipunku')}
if(b.dataset.pet!==undefined){save.pet=b.dataset.pet;buildPet(save.pet);persist();renderPanel();showToast(save.pet==='none'?'Zwierzak odwołany':'Masz nowego pupila!')}
if(b.dataset.emote!==undefined){emote=b.dataset.emote;emoteClock=0;showToast('Emotka: '+emote)}
if(b.dataset.weather){weather=b.dataset.weather;save.weather=weather;persist();applyAtmosphere();renderPanel();showToast('Zmieniono pogodę')}
if(b.dataset.quality){setQuality(b.dataset.quality);renderPanel();showToast('Zmieniono jakość grafiki')}
if(b.dataset.photo){togglePanel(activePage);togglePhoto()}
if(b.dataset.lock){save.locked=!save.locked;persist();renderPanel();showToast(save.locked?'Zamknięto drzwi (RP)':'Otwarto drzwi')}
if(b.dataset.homecolor){save.homeColor=(save.homeColor+1)%5;repaintHome();persist();renderPanel();showToast('Nowy kolor domu')}
if(b.dataset.saveprofile){save.rpName=(el('rpName')?.value||'Gracz').trim().slice(0,24)||'Gracz';save.bio=(el('rpBio')?.value||'').trim().slice(0,80);persist();updateHud();renderPanel();showToast('Zapisano profil RP')}
if(b.dataset.spawn!==undefined){if(inside){showToast('Wyjdź z domu, żeby przywołać auto');return}replaceVehicle(Number(b.dataset.spawn));
const roadX=Math.round(playerPos.x/60)*60,roadZ=Math.round(playerPos.z/60)*60;
if(Math.abs(roadX-playerPos.x)<Math.abs(roadZ-playerPos.z)){car.root.position.set(roadX+4,0,playerPos.z+6);carYaw=0}
else{car.root.position.set(playerPos.x+6,0,roadZ+4);carYaw=Math.PI/2}
driving=false;carSpeed=0;car.root.rotation.y=carYaw;avatar.visible=true;showToast('Auto jest na najbliższej ulicy!')}
if(b.dataset.home){if(!save.house)return;const h=homes.find(h=>h.id===save.house);if(h){if(driving){driving=false;avatar.visible=true;playerPos.set(car.root.position.x+4,0,car.root.position.z+4)}if(inside){inside=false}playerPos.copy(h.entry);showToast('Jesteś przy swoim domu!');togglePanel(activePage)}}
});
const housePaints=[0xf9d28f,0xa7d4d9,0xe9b5b5,0xd8c6eb,0xc4d6a3].map(c=>mat(c));
function repaintHome(){const home=homes.find(h=>h.id===save.house);if(home)home.facade.material=housePaints[save.homeColor]}
repaintHome();
function updateHud(){el('cash').textContent='$ '+save.cash.toLocaleString('pl-PL');el('role').textContent=save.rpName+' · '+save.job;el('mission').textContent=save.delivery+'/5';el('taskProgress').style.width=(save.delivery/5*100)+'%'}
updateHud();
let points=[[0,-60],[120,0],[0,120],[-120,0],[180,120]],destinationIndex=0;
const marker=new T.Group();scene.add(marker);
const torus=new T.Mesh(new T.TorusGeometry(2.8,.25,9,36),m.yellow);torus.position.y=3.3;marker.add(torus);
const beamMat=new T.MeshBasicMaterial({color:0xcaff60,transparent:true,opacity:.18,side:T.DoubleSide,depthWrite:false});
const beam=new T.Mesh(new T.CylinderGeometry(2.5,2.5,6.5,18,1,true),beamMat);beam.position.y=3.35;marker.add(beam);
function setMarker(){const p=points[save.delivery%points.length];marker.position.set(p[0],0,p[1])}setMarker();
function nearObj(){if(inside){if(playerPos.distanceTo(new T.Vector3(0,0,630))<8)return {kind:'exit',label:'Wyjdź z domu'};return null}
if(driving)return{kind:'leave',label:'Wysiądź z samochodu'};
const distance=playerPos.distanceTo(car.root.position);if(distance<7)return{kind:'enter',label:'Wsiądź do samochodu'};
let chosen=null,best=7;
for(const h of homes){const d=playerPos.distanceTo(h.entry);if(d<best){best=d;chosen={kind:'home',value:h,label:save.house===h.id?'Wejdź do swojego domu':'Zajmij dom nr '+h.id}}}
for(const b of businesses){const d=playerPos.distanceTo(b.entry);if(d<best){best=d;chosen={kind:'business',value:b,label:'Odwiedź: '+b.name}}}
return chosen;
}
function interact(){if(!started||paused)return;const obj=nearObj();if(!obj){showToast('Podejdź do samochodu, domu lub budynku');return}
if(obj.kind==='leave'){driving=false;avatar.visible=true;playerPos.set(car.root.position.x+4,0,car.root.position.z+3);carSpeed=0;showToast('Wysiadłeś z samochodu')}
if(obj.kind==='enter'){driving=true;avatar.visible=false;carYaw=car.root.rotation.y;carSpeed=0;showToast('Witaj za kierownicą!')}
if(obj.kind==='home'){const h=obj.value;if(save.house!==h.id){save.house=h.id;save.locked=false;repaintHome();persist();showToast('Zajęto dom numer '+h.id)}else showToast('Witaj w swoim domu');exitPosition=h.entry.clone();inside=true;driving=false;avatar.visible=true;playerPos.set(0,0,629);charYaw=Math.PI}
if(obj.kind==='exit'){inside=false;playerPos.copy(exitPosition||new T.Vector3(8,0,19));playerPos.z+=3;charYaw=Math.PI;showToast('Wróciłeś do miasta')}
if(obj.kind==='business'){const b=obj.value;if(b.kind==='hospital')save.job='Lekarz';if(b.kind==='police')save.job='Policjant';if(b.kind==='cafe'||b.kind==='shop')save.job='Sprzedawca';if(b.kind==='garage'){togglePanel('cars');showToast('Witamy w salonie!');return}if(b.kind==='school'){showToast('Witaj w szkole!');return}persist();updateHud();showToast('Odwiedzono: '+b.name+' · zawód: '+save.job)}
}
el('interact').onclick=interact;
function blocked(x,z){if(Math.abs(x)>198||Math.abs(z)>198)return true;for(const b of colliders)if(x>b.x1-1.1&&x<b.x2+1.1&&z>b.z1-1.1&&z<b.z2+1.1)return true;return false}
function moveCharacter(dt){const f=(key.has('forward')?1:0)-(key.has('back')?1:0),turn=(key.has('left')?1:0)-(key.has('right')?1:0);charYaw+=turn*dt*2.2;let speed=(key.has('run')?12:7)*f;
const nx=playerPos.x-Math.sin(charYaw)*speed*dt,nz=playerPos.z-Math.cos(charYaw)*speed*dt;
if(inside){if(Math.abs(nx)<11&&Math.abs(nz-620)<11){playerPos.x=nx;playerPos.z=nz}}
else if(!blocked(nx,nz)){playerPos.x=nx;playerPos.z=nz}
avatar.position.copy(playerPos);avatar.rotation.y=charYaw;
if(Math.abs(speed)>0){stepTime+=dt*10;leftArm.rotation.x=Math.sin(stepTime)*.25;rightArm.rotation.x=-Math.sin(stepTime)*.25;for(let i=0;i<legs.length;i++)legs[i].rotation.x=Math.sin(stepTime+i*Math.PI)*.11}
else{leftArm.rotation.x*=.8;rightArm.rotation.x*=.8;for(const l of legs)l.rotation.x*=.8}
}
function moveCar(dt){let gas=(key.has('forward')?1:0),reverse=key.has('back')?1:0;
if(gas)carSpeed+=24*dt;else if(reverse)carSpeed-=30*dt;else carSpeed*=Math.exp(-1.6*dt);
carSpeed=Math.max(-12,Math.min(vehicleModels[save.vehicle].speed,carSpeed));if(Math.abs(carSpeed)<.08)carSpeed=0;
const steering=(key.has('left')?1:0)-(key.has('right')?1:0);
if(Math.abs(carSpeed)>.3)carYaw+=steering*dt*(.8+Math.min(Math.abs(carSpeed),24)*.017)*Math.sign(carSpeed);
const nx=car.root.position.x-Math.sin(carYaw)*carSpeed*dt,nz=car.root.position.z-Math.cos(carYaw)*carSpeed*dt;
if(blocked(nx,nz)){carSpeed*=-.18}else{car.root.position.x=nx;car.root.position.z=nz}
car.root.rotation.y=carYaw;
playerPos.set(car.root.position.x,0,car.root.position.z);charYaw=carYaw;
}
function updateTraffic(dt){for(const t of traffic){t.t+=dt*t.speed*t.dir;if(t.t>192)t.t=-192;if(t.t< -192)t.t=192;
const x=t.vertical?t.lane:t.t,z=t.vertical?t.t:t.lane;t.model.root.position.set(x,0,z);t.model.root.rotation.y=t.vertical?(t.dir===1?Math.PI:0):(t.dir===1?-Math.PI/2:Math.PI/2);
if(driving&&Math.hypot(x-car.root.position.x,z-car.root.position.z)<4){carSpeed*=-.2}
}}
function progress(dt){if(inside)return;const t=driving?car.root.position:playerPos;if(Math.hypot(t.x-marker.position.x,t.z-marker.position.z)<5.4){save.cash+=250;save.delivery++;if(save.delivery>=5){save.cash+=650;save.delivery=0;showToast('Ukończono trasę! +$900')}else showToast('Dostawa zakończona! +$250');persist();setMarker();updateHud()}}
function cameraUpdate(dt){
 const target=driving?car.root.position:playerPos,rot=(driving?carYaw:charYaw)+orbitYaw;
 const dist=(highView?31:driving?19:11)*cameraDistance,height=(highView?32:driving?11:7)+orbitLift;
 const p=new T.Vector3(target.x+Math.sin(rot)*dist,Math.max(2.5,height),target.z+Math.cos(rot)*dist);
 if(inside){p.x=target.x+Math.sin(rot)*Math.min(9,dist);p.y=Math.min(7,Math.max(2.7,5+orbitLift*.1));p.z=target.z+Math.cos(rot)*Math.min(9,dist)}
 cam.position.lerp(p,1-Math.exp(-5*dt));
 cam.lookAt(target.x,driving?1.7:2.2,target.z);
 const fieldOfView=driving?65+Math.min(8,Math.abs(carSpeed)*.15):61;
 cam.fov+=(fieldOfView-cam.fov)*Math.min(1,dt*4);
 cam.updateProjectionMatrix();
 sun.position.set(target.x-75,140,target.z+90);sun.target.position.set(target.x,0,target.z);sun.target.updateMatrixWorld()
}
const mc=el('map'),ctx=mc.getContext('2d');
function minimap(){
const s=316,scale=.64;ctx.fillStyle='#182e3b';ctx.fillRect(0,0,s,s);
if(inside){ctx.fillStyle='#a4b4ac';ctx.fillRect(60,60,196,196);ctx.fillStyle='#405564';ctx.fillRect(78,78,160,160);ctx.fillStyle='#aeff79';ctx.beginPath();ctx.arc(s/2,s/2,8,0,Math.PI*2);ctx.fill();return}
ctx.save();ctx.translate(s/2,s/2);ctx.rotate(driving?carYaw:charYaw);ctx.translate(-playerPos.x*scale,-playerPos.z*scale);
ctx.fillStyle='#69878d';for(let k=-3;k<=3;k++){ctx.fillRect(k*60*scale-5.6,-205*scale,11.2,410*scale);ctx.fillRect(-205*scale,k*60*scale-5.6,410*scale,11.2)}
ctx.fillStyle='#8b9fa2';for(const b of colliders)ctx.fillRect(b.x1*scale,b.z1*scale,(b.x2-b.x1)*scale,(b.z2-b.z1)*scale);
ctx.strokeStyle='#d2ff78aa';ctx.lineWidth=2;ctx.setLineDash([7,6]);ctx.beginPath();ctx.moveTo(playerPos.x*scale,playerPos.z*scale);ctx.lineTo(marker.position.x*scale,marker.position.z*scale);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#d1ff83';ctx.beginPath();ctx.arc(marker.position.x*scale,marker.position.z*scale,7,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#ffdaa0';for(const h of homes)if(h.id===save.house){ctx.beginPath();ctx.arc(h.x*scale,h.z*scale,5,0,Math.PI*2);ctx.fill()}ctx.restore();
ctx.fillStyle='#baff6b';ctx.shadowColor='#baff6b';ctx.shadowBlur=10;ctx.beginPath();ctx.moveTo(s/2,s/2-10);ctx.lineTo(s/2-7,s/2+9);ctx.lineTo(s/2+7,s/2+9);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#e6f6ff';ctx.font='900 14px system-ui';ctx.fillText('N',s/2-5,15)
}
let currentZone='';
function updateZoneHud(){
 if(inside){currentZone='TWÓJ DOM'}
 else{
  const nearest=businesses.reduce((best,b)=>{const d=(b.x-playerPos.x)**2+(b.z-playerPos.z)**2;return d<best.d?{d,b}:best},{d:Infinity,b:null});
  currentZone=nearest.d<1100?nearest.b.name.toUpperCase():Math.abs(playerPos.x)<65&&Math.abs(playerPos.z)<65?'CENTRUM MIASTA':playerPos.x>65?'WSCHODNIA DZIELNICA':playerPos.x< -65?'ZACHODNIA DZIELNICA':'OSIEDLE PARKOWE';
 }
 el('zone').textContent=currentZone;
 const mins=(night?22*60+10:10*60+45)+Math.floor(clock.elapsedTime/4);
 const hh=String(Math.floor(mins/60)%24).padStart(2,'0'),mm=String(mins%60).padStart(2,'0');
 el('clock').textContent=hh+':'+mm+' • '+(night?'NOC':weather==='rain'?'DESZCZ':weather==='fog'?'MGŁA':'SŁONECZNIE');
}
function renderHUD(){updateZoneHud();const a=nearObj();el('interact').style.display=a&&!paused?'block':'none';el('interactText').textContent=a?a.label:'';
el('mode').textContent=inside?'🏠 W DOMU':driving?'🚘 PROWADZENIE AUTA':'🚶 SPACER PO MIEŚCIE';el('speed').style.display=driving?'block':'none';
el('speed').firstChild.textContent=String(Math.round(Math.abs(carSpeed)*3.2))+' ';
minimap()}
W.addEventListener('resize',()=>{cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
cam.position.set(8,8,35);cam.lookAt(8,1,19);
function loop(){requestAnimationFrame(loop);let dt=Math.min(.045,clock.getDelta());if(!paused&&!photoMode){if(driving)moveCar(dt);else moveCharacter(dt);animateRoleplay(dt);animateWeather(dt);updateTraffic(dt);progress(dt);payTick+=dt;if(payTick>60){payTick-=60;if(save.job!=='Mieszkaniec'){save.cash+=500;persist();updateHud();showToast('Wypłata za pracę: +$500')}}marker.rotation.y+=dt*.65;torus.rotation.z+=dt*.7;
for(const n of npc){const tt=clock.elapsedTime*.45+n.seed;n.g.position.set(n.x+Math.cos(tt)*3,0,n.z+Math.sin(tt)*3);n.g.rotation.y=-tt;n.l.rotation.x=Math.sin(tt*6)*.27;n.r.rotation.x=-Math.sin(tt*6)*.27}
}
cameraUpdate(dt);skyDome.position.copy(driving?car.root.position:playerPos);skyDome.visible=!inside;updateStreetLights();updateAudio();renderer.render(scene,cam);uiTick+=dt;if(uiTick>.17){renderHUD();uiTick=0}}
window.__nexoBootReady=true;
const bootButton=el('startBtn');bootButton.disabled=false;bootButton.removeAttribute('aria-busy');bootButton.textContent='▶ WEJDŹ DO MIASTA';
el('bootStatus').textContent='✓ Miasto załadowane. Możesz rozpocząć grę.';
loop();
