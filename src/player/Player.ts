import * as THREE from 'three';
import { box, material } from '../world/geometry';
import type { CollisionRect, MoveInput } from '../core/types';

export class Player {
  readonly group = new THREE.Group();
  readonly position = new THREE.Vector3();
  private readonly torso = new THREE.Group();
  private readonly leftArm = new THREE.Group();
  private readonly rightArm = new THREE.Group();
  private readonly legs:THREE.Group[] = [];
  private shirt:THREE.MeshStandardMaterial;
  private velocityY=0;
  private movingTime=0;
  private heading=0;
  private pose:'stand'|'sit'|'sleep'='stand';
  private grounded=true;
  moving=false;

  constructor(color:number) {
    this.shirt=material(color);
    const skin=material(0xf2c49c),trousers=material(0x3d536a),shoes=material(0x202b38),hair=material(0x503b31);
    this.group.add(this.torso);
    box(this.torso,0,1.89,0,1.25,1.55,.68,this.shirt);
    box(this.torso,0,2.94,0,.92,.93,.82,skin);
    box(this.torso,0,3.4,.02,.96,.32,.90,hair);
    for(const xx of [-.23,.23])box(this.torso,xx,3.03,-.43,.11,.13,.08,material(0x2c3237),false);
    for(const [arm,xx] of [[this.leftArm,-.84],[this.rightArm,.84]] as const) {
      arm.position.set(xx,2.42,0);this.torso.add(arm);
      box(arm,0,-.46,0,.45,.98,.5,this.shirt);
      box(arm,0,-1.01,0,.46,.28,.5,skin);
    }
    for(const xx of [-.34,.34]){
      const leg=new THREE.Group();leg.position.set(xx,1.14,0);this.torso.add(leg);
      box(leg,0,-.44,0,.49,.96,.55,trousers);
      box(leg,0,-.96,-.13,.52,.26,.85,shoes);
      this.legs.push(leg);
    }
    this.torso.castShadow=true;this.group.scale.set(.95,.95,.95);
  }

  setColor(hex:number):void {
    this.shirt.color.setHex(hex);
  }
  setPose(pose:'stand'|'sit'|'sleep'):void {
    this.pose=this.pose===pose?'stand':pose;
  }
  update(dt:number, input:MoveInput, cameraYaw:number, colliders:readonly CollisionRect[]):void {
    const length=Math.hypot(input.forward,input.right);
    const speed=input.run?9.3:5.5;
    this.moving=length>.02;
    if(this.moving){
      this.pose='stand';
      const f=input.forward/length,r=input.right/length;
      const dx=-Math.sin(cameraYaw)*f+Math.cos(cameraYaw)*r;
      const dz=-Math.cos(cameraYaw)*f-Math.sin(cameraYaw)*r;
      const nx=this.position.x+dx*speed*dt,nz=this.position.z+dz*speed*dt;
      if(!this.isBlocked(nx,this.position.z,colliders))this.position.x=nx;
      if(!this.isBlocked(this.position.x,nz,colliders))this.position.z=nz;
      const desired=Math.atan2(-dx,-dz);
      this.heading+=Math.atan2(Math.sin(desired-this.heading),Math.cos(desired-this.heading))*Math.min(1,dt*12);
      this.group.rotation.y=this.heading;
    }
    if(input.jump&&this.grounded&&this.pose==='stand'){
      this.velocityY=8.2;this.grounded=false;
    }
    if(!this.grounded){
      this.velocityY-=21*dt;this.position.y=Math.max(0,this.position.y+this.velocityY*dt);
      if(this.position.y<=0){this.velocityY=0;this.grounded=true;}
    }
    this.group.position.copy(this.position);
    this.movingTime+=dt*(input.run?12.4:8.3);
    const swing=this.moving?Math.sin(this.movingTime)*.6:0;
    this.leftArm.rotation.x=swing;this.rightArm.rotation.x=-swing;
    this.legs[0].rotation.x=-swing*.8;this.legs[1].rotation.x=swing*.8;
    this.leftArm.rotation.z=0;this.rightArm.rotation.z=0;
    this.torso.rotation.x=0;this.torso.position.y=this.grounded?.016*Math.sin(this.movingTime):0;
    if(this.pose==='sit'){
      this.torso.position.y=-.42;this.legs[0].rotation.x=-1.35;this.legs[1].rotation.x=-1.35;
      this.leftArm.rotation.x=-.35;this.rightArm.rotation.x=-.35;
    }
    if(this.pose==='sleep'){
      this.torso.position.y=.15;this.torso.rotation.x=-Math.PI/2;
      this.legs[0].rotation.x=0;this.legs[1].rotation.x=0;
    }
  }
  private isBlocked(x:number,z:number,colliders:readonly CollisionRect[]):boolean {
    const radius=.40;
    return colliders.some(c=>x+radius>c.minX&&x-radius<c.maxX&&z+radius>c.minZ&&z-radius<c.maxZ);
  }
}
