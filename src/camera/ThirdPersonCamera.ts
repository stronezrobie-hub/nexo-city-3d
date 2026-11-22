import * as THREE from 'three';
export class ThirdPersonCamera {
  /** Kąt pozwalający sterować postacią względem widoku. */
  yaw=Math.PI;
  private pitch=.38;
  private distance=8.5;
  private dragId:number|null=null;
  private lastX=0;private lastY=0;
  readonly camera:THREE.PerspectiveCamera;
  constructor(canvas:HTMLCanvasElement){
    this.camera=new THREE.PerspectiveCamera(66,innerWidth/innerHeight,.1,420);
    canvas.addEventListener('pointerdown',event=>{
      if(event.pointerType==='mouse'&&event.button!==0&&event.button!==2)return;
      this.dragId=event.pointerId;this.lastX=event.clientX;this.lastY=event.clientY;
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener('pointermove',event=>{
      if(this.dragId!==event.pointerId)return;
      const dx=event.clientX-this.lastX,dy=event.clientY-this.lastY;
      this.yaw-=dx*.006;this.pitch=Math.max(.08,Math.min(1.02,this.pitch+dy*.004));
      this.lastX=event.clientX;this.lastY=event.clientY;
    });
    for(const type of ['pointerup','pointercancel'] as const)
      canvas.addEventListener(type,event=>{if(event.pointerId===this.dragId)this.dragId=null;});
    canvas.addEventListener('wheel',event=>{event.preventDefault();
      this.distance=Math.max(4.3,Math.min(14,this.distance+Math.sign(event.deltaY)*.75));
    },{passive:false});
    canvas.addEventListener('contextmenu',event=>event.preventDefault());
  }
  update(dt:number,target:THREE.Vector3):void {
    const distance=this.distance;
    const flat=distance*Math.cos(this.pitch);
    const desired=new THREE.Vector3(
      target.x+Math.sin(this.yaw)*flat,
      target.y+2.25+distance*Math.sin(this.pitch),
      target.z+Math.cos(this.yaw)*flat,
    );
    this.camera.position.lerp(desired,1-Math.exp(-12*dt));
    this.camera.lookAt(target.x,target.y+1.9,target.z);
  }
  resize(w:number,h:number):void{this.camera.aspect=w/Math.max(1,h);this.camera.updateProjectionMatrix();}
}
