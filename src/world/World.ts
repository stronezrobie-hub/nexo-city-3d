import * as THREE from 'three';
import { box, material, sign } from './geometry';
import { House } from './House';
import type { CollisionRect, GameInteraction } from '../core/types';

interface Vehicle { group: THREE.Group; axis:'x'|'z'; lane:number; speed:number; direction:1|-1; }
interface Citizen { group: THREE.Group; origin:THREE.Vector3; seed:number; }

/** Mapa miasta złożona z lekkich geometrii i instancji drzew. */
export class World {
  readonly scene = new THREE.Scene();
  readonly house = new House(35, 35);
  readonly colliders: CollisionRect[] = [];
  readonly interactions: GameInteraction[] = [];
  readonly sun = new THREE.DirectionalLight(0xffe2af, 2.7);
  readonly hemisphere = new THREE.HemisphereLight(0xbce6ff, 0x789c67, 2.2);
  private vehicles: Vehicle[] = [];
  private citizens: Citizen[] = [];
  private lampMaterials: THREE.MeshStandardMaterial[] = [];
  private stars: THREE.Points;
  readonly spawn = new THREE.Vector3(35, 0, 18);

  constructor() {
    this.scene.background = new THREE.Color(0x93c9ef);
    this.scene.fog = new THREE.Fog(0x93c9ef, 90, 250);
    this.sun.position.set(-75, 115, -45);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(1024,1024);
    this.sun.shadow.camera.left = -85; this.sun.shadow.camera.right = 85;
    this.sun.shadow.camera.top = 85; this.sun.shadow.camera.bottom = -85;
    this.sun.shadow.camera.near = 3; this.sun.shadow.camera.far = 300;
    this.sun.shadow.normalBias = .035;
    this.scene.add(this.sun, this.sun.target, this.hemisphere);
    this.createTerrain();
    this.createRoads();
    this.createDistrict();
    this.createTrees();
    this.createLamps();
    this.createTraffic();
    this.createCitizens();
    this.scene.add(this.house.group);
    this.interactions.push(...this.house.interactions);
    const starGeo = new THREE.BufferGeometry();
    const pos: number[] = []; let seed=4251;
    for(let i=0;i<240;i++){
      seed=(seed*1664525+1013904223)>>>0;const a=seed/4294967296*Math.PI*2;
      seed=(seed*1664525+1013904223)>>>0;const v=.25+seed/4294967296*.65;
      const r=310*Math.sqrt(1-v*v);
      pos.push(Math.cos(a)*r,310*v,Math.sin(a)*r);
    }
    starGeo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    this.stars=new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xf6faff,size:1.7,sizeAttenuation:false}));
    this.stars.visible=false;this.scene.add(this.stars);
  }

  private createTerrain(): void {
    const grass = material(0x79bc72);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(430,430),grass);
    floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;this.scene.add(floor);
    // Niewysoki pagórek na obrzeżach miasta.
    for(let i=0;i<12;i++){
      const x=Math.cos(i*.53)*172,z=Math.sin(i*.53)*172;
      const mound=new THREE.Mesh(new THREE.ConeGeometry(30+i%4*4,25+i%3*6,5), material(i%2?0x83aa75:0x76a779));
      mound.position.set(x,9,z);mound.rotation.y=i*.46;mound.receiveShadow=true;this.scene.add(mound);
    }
  }

  private createRoads(): void {
    const asphalt=material(0x333e4b),pavement=material(0xb9c3c5),line=material(0xece5bb);
    for(const location of [-75,0,75]){
      box(this.scene,location,.13,0,14,.26,370,asphalt,false);
      box(this.scene,0,.13,location,370,.26,14,asphalt,false);
      for(const offset of [-9,9]){
        box(this.scene,location+offset,.23,0,4,.38,370,pavement,false);
        box(this.scene,0,.23,location+offset,370,.38,4,pavement,false);
        box(this.scene,location+offset* .80,.257,0,.17,.012,370,material(0xd8dfdf),false);
        box(this.scene,0,.257,location+offset* .80,370,.012,.17,material(0xd8dfdf),false);
      }
      for(let n=-175;n<175;n+=12) {
        if([-75,0,75].some(p=>Math.abs(n-p)<13))continue;
        box(this.scene,location,.275,n, .22,.01,5.5,line,false);
        box(this.scene,n,.276,location,5.5,.01,.22,line,false);
      }
    }
    const zebra=material(0xf6f4e7);
    for(const x of [-75,0,75])for(const z of [-75,0,75]){
      for(let k=-4;k<=4;k++){
        box(this.scene,x+k*1.36,.29,z-11, .87,.025,4.2,zebra,false);
        box(this.scene,x+11,.29,z+k*1.36,4.2,.025,.87,zebra,false);
      }
    }
  }

  private createDistrict(): void {
    this.landmark(-37,-39,'SZKOŁA',0xf5cf8b,13);
    this.landmark(39,-39,'SKLEP',0xf8a994,10);
    this.landmark(110,-38,'SZPITAL',0xcbdbe9,17);
    this.landmark(-112,-39,'POLICJA',0x89b2d4,12);
    this.landmark(38,-111,'STACJA PALIW',0xe2d69b,7);
    this.landmark(-39,-112,'RESTAURACJA',0xd8b8a3,9);
    this.landmark(-112,112,'APARTAMENTY',0xb4c0e8,23);
    this.landmark(-112,-112,'BIURA',0xaccfca,17);
    // Makiety przyszłych domów. Wnętrze ma na razie jeden dom (etap 1).
    const lots=[[110,35,8],[-111,34,9],[39,112,9],[-38,110,10],[112,111,12]];
    for(let i=0;i<lots.length;i++){
      const [x,z,h]=lots[i], root=new THREE.Group();root.position.set(x,0,z);this.scene.add(root);
      const wall=material([0xeccbad,0xb7d1e0,0xe5bed4,0xe4d7b4,0xbbd9c9][i]);
      box(root,0,h/2,0,19,h,16,wall);
      box(root,0,h+.3,0,20,.65,17,material(0x4f6670));
      box(root,0,2,-8.2,2.4,3.4,.3,material(0x906747),false);
      for(const xx of [-6,0,6])for(const yy of [4,Math.min(h-1,8)]){
        box(root,xx,yy,-8.18,2.4,2,.12,material(0x77bdce,.28),false);
      }
      this.colliders.push({minX:x-9.7,maxX:x+9.7,minZ:z-8.2,maxZ:z+8.2});
    }
    // Park z centralną fontanną, ławkami i alejką.
    const park=new THREE.Group();park.position.set(-37,0,35);this.scene.add(park);
    box(park,0,.31,0,47,.1,42,material(0x9fcb8a),false);
    box(park,0,.36,0,4,.1,42,material(0xe8d8b8),false);
    box(park,0,.36,0,47,.1,4,material(0xe8d8b8),false);
    const bowl=new THREE.Mesh(new THREE.CylinderGeometry(4.2,4.8,.9,28),material(0xa6b6b8));
    bowl.position.y=.8;bowl.receiveShadow=true;park.add(bowl);
    const water=new THREE.Mesh(new THREE.CylinderGeometry(3.9,4,.10,28),material(0x67bdd9,.23));
    water.position.y=1.31;park.add(water);
    const fountain=new THREE.Mesh(new THREE.CylinderGeometry(.3,.9,2.8,12),material(0xdbd7c7));
    fountain.position.y=2.2;park.add(fountain);
    for(const zz of [-14,14])for(const xx of [-13,13]){
      box(park,xx,.90,zz,3.2,.25,1.0,material(0x8f6c51));
      box(park,xx,1.55,zz-.45,3.2,1.05,.20,material(0x8f6c51));
    }
    const title=sign('PARK NEXO',8,1.45);title.position.set(-37,4.6,10);this.scene.add(title);
  }

  private landmark(x:number,z:number,label:string,color:number,height:number):void {
    const group=new THREE.Group();group.position.set(x,0,z);this.scene.add(group);
    box(group,0,height/2,0,25,height,20,material(color));
    box(group,0,height+.3,0,26,.5,21,material(0x4f6170));
    box(group,0,2,-10.14,4.2,3.7,.25,material(0x82c9d7,.2),false);
    for(let y=5;y<height-1;y+=3.6)for(const xx of [-8.5,-4.2,0,4.2,8.5]){
      box(group,xx,y,-10.13,2.2,2,.11,material(0x89bacb,.32),false);
    }
    const board=sign(label,12,1.6);board.position.set(0,height-1.55,-10.26);group.add(board);
    this.colliders.push({minX:x-12.5,maxX:x+12.5,minZ:z-10.5,maxZ:z+10.5});
  }

  private createTrees():void {
    const positions:THREE.Vector3[] = [];
    for(const [bx,bz] of [[-37,35],[-37,35],[110,112],[-112,112],[38,113],[-110,35],[-37,110]]){
      for(let i=0;i<9;i++){
        const x=bx+(i%3-1)*14+(i%2)*2,z=bz+(Math.floor(i/3)-1)*13;
        // Nie sadzimy drzew na asfaltowych drogach ani tuż pod drzwiami.
        if([-75,0,75].some(r=>Math.abs(x-r)<12||Math.abs(z-r)<12))continue;
        if(Math.abs(x-this.house.x)<12&&Math.abs(z-this.house.z)<12)continue;
        positions.push(new THREE.Vector3(x,0,z));
      }
    }
    const trunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(.33,.46,4.7,6),
      material(0x79614a),positions.length);
    const crowns=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(3.4,1),
      material(0x478e5a),positions.length);
    const dummy=new THREE.Object3D();
    positions.forEach((p,i)=>{
      dummy.position.set(p.x,2.35,p.z);dummy.scale.set(1,1,1);dummy.rotation.set(0,0,0);dummy.updateMatrix();
      trunks.setMatrixAt(i,dummy.matrix);
      dummy.position.y=6.1;dummy.scale.set(1+(i%3)*.08,.95,1.0);dummy.rotation.y=i*.31;dummy.updateMatrix();
      crowns.setMatrixAt(i,dummy.matrix);
      crowns.setColorAt(i,new THREE.Color([0x478e5a,0x5d9e62,0x7aaf68][i%3]));
    });
    trunks.instanceMatrix.needsUpdate=true;crowns.instanceMatrix.needsUpdate=true;
    crowns.castShadow=false;trunks.castShadow=false;
    this.scene.add(trunks,crowns);
  }

  private createLamps():void {
    const places:[number,number][]=[];
    for(const loc of [-75,0,75])for(const pos of [-145,-120,-95,-55,-27,25,52,98,122,145]){
      places.push([loc-10,pos]);places.push([pos,loc-10]);
    }
    const metal=material(0x435765),yellow=new THREE.MeshStandardMaterial({
      color:0xffe5ad,emissive:0xffcd75,emissiveIntensity:.42,
    });
    this.lampMaterials.push(yellow);
    const poles=new THREE.InstancedMesh(new THREE.CylinderGeometry(.10,.15,6,6),metal,places.length);
    const heads=new THREE.InstancedMesh(new THREE.BoxGeometry(1.45,.18,.65),yellow,places.length);
    const dummy=new THREE.Object3D();
    places.forEach(([x,z],i)=>{
      dummy.position.set(x,3,z);dummy.scale.set(1,1,1);dummy.updateMatrix();poles.setMatrixAt(i,dummy.matrix);
      dummy.position.set(x+ .7,6,z);dummy.updateMatrix();heads.setMatrixAt(i,dummy.matrix);
    });
    this.scene.add(poles,heads);
  }

  private createTraffic():void {
    const colors=[0xc05a52,0x7aa4bf,0xd5d2b2,0x5e9178,0xe0b05b];
    for(let i=0;i<6;i++){
      const g=new THREE.Group(),color=material(colors[i%colors.length]),xAxis=i%2===0;
      box(g,0,1.05,0,2.7,1.0,5.2,color);
      box(g,0,1.85,-.3,2.3,.9,2.65,material(0x8ac8d8,.2));
      for(const xx of [-1.28,1.28])for(const zz of [-1.65,1.65]){
        const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,.28,10),material(0x24333c));
        wheel.rotation.z=Math.PI/2;wheel.position.set(xx,.66,zz);g.add(wheel);
      }
      this.scene.add(g);
      this.vehicles.push({group:g,axis:xAxis?'x':'z',lane:xAxis?-75:75,speed:5.5+i*.9,direction:i%3===0?-1:1});
    }
  }

  private createCitizens():void {
    const positions:[[number,number],[number,number],[number,number],[number,number]]=[
      [-36,20],[39,-15],[-105,-14],[104,22],
    ];
    for(let i=0;i<positions.length;i++){
      const [x,z]=positions[i],root=new THREE.Group();
      const skin=material(0xebc1a0),shirt=material([0xe6a77b,0x6a9ed2,0xb9a1d5,0x70b5a2][i]);
      box(root,0,1.55,0,.78,1.25,.52,shirt);
      box(root,0,2.56,0,.75,.75,.7,skin);
      box(root,-.25,.63,0,.25,1.16,.27,material(0x34485e));
      box(root,.25,.63,0,.25,1.16,.27,material(0x34485e));
      box(root,-.55,1.56,0,.24,1.18,.28,skin);
      box(root,.55,1.56,0,.24,1.18,.28,skin);
      root.position.set(x,0,z);this.scene.add(root);
      this.citizens.push({group:root,origin:new THREE.Vector3(x,0,z),seed:i*.8});
    }
  }

  getColliders(): CollisionRect[] {
    return [...this.colliders,...this.house.getColliders()];
  }
  nearestInteraction(position:THREE.Vector3):GameInteraction|null {
    let best:GameInteraction|null=null,nearest=Infinity;
    for(const entry of this.interactions){
      const distance=position.distanceTo(entry.position);
      if(distance<entry.radius&&distance<nearest){nearest=distance;best=entry;}
    }
    return best;
  }
  update(dt:number,elapsed:number,player:THREE.Vector3):void {
    this.house.update(player);
    for(const v of this.vehicles) {
      const p=v.group.position;
      if(v.axis==='x'){p.z=v.lane+4;p.x+=dt*v.speed*v.direction;p.x=Math.max(-172,Math.min(172,p.x));if(Math.abs(p.x)>=172)v.direction=v.direction===1?-1:1;}
      else{p.x=v.lane-4;p.z+=dt*v.speed*v.direction;p.z=Math.max(-172,Math.min(172,p.z));if(Math.abs(p.z)>=172)v.direction=v.direction===1?-1:1;}
      v.group.rotation.y=v.axis==='x'?(v.direction===1?Math.PI/2:-Math.PI/2):(v.direction===1?0:Math.PI);
    }
    for(const citizen of this.citizens){
      citizen.group.position.x=citizen.origin.x+Math.sin(elapsed*.32+citizen.seed)*5;
      citizen.group.position.z=citizen.origin.z+Math.cos(elapsed*.35+citizen.seed)*3;
      citizen.group.rotation.y=Math.sin(elapsed*.35+citizen.seed);
    }
  }
  updateLight(progress:number,player:THREE.Vector3):void {
    const angle=progress*Math.PI*2;
    const height=Math.sin(angle);
    const daylight=Math.max(.04,Math.min(1,(height+.2)*1.3));
    const dayColor=new THREE.Color(0x9cd3f2),nightColor=new THREE.Color(0x0e2341);
    const color=nightColor.clone().lerp(dayColor,daylight);
    this.scene.background=color;
    if(this.scene.fog instanceof THREE.Fog){this.scene.fog.color.copy(color);}
    this.hemisphere.intensity=.45+daylight*1.7;
    this.sun.intensity=.1+daylight*2.5;
    this.sun.color.set(daylight<.5?0xffb98c:0xffe6be);
    this.sun.position.set(player.x+Math.cos(angle)*90,25+Math.abs(height)*115,player.z-50);
    this.sun.target.position.set(player.x,0,player.z);
    this.sun.target.updateMatrixWorld();
    this.stars.visible=daylight<.3;
    this.stars.position.set(player.x,0,player.z);
    for(const lamp of this.lampMaterials)lamp.emissiveIntensity=daylight<.4?1.8:.25;
  }
}
