import * as THREE from 'three';
import { World } from '../world/World';
import { Player } from '../player/Player';
import { ThirdPersonCamera } from '../camera/ThirdPersonCamera';
import { Input } from '../controls/Input';
import { Hud } from '../ui/Hud';
import { loadSave,writeSave } from '../systems/Save';
import type { GameInteraction,GameSave,Quality } from './types';

/** Główna pętla. Moduły świata, postaci, sterowania i UI pozostają niezależne. */
export class Game {
  readonly hud:Hud;
  readonly renderer:THREE.WebGLRenderer;
  readonly world:World;
  readonly player:Player;
  readonly camera:ThirdPersonCamera;
  readonly input:Input;
  private save:GameSave;
  private started=false;
  private paused=false;
  private clock=new THREE.Clock();
  private elapsed=0;
  private gameClock=.09;
  private hudElapsed=0;
  private currentInteraction:GameInteraction|null=null;
  private frame=0;

  constructor(root:HTMLElement){
    this.save=loadSave();
    this.hud=new Hud(root,{
      onQuality:q=>this.changeQuality(q),
      onColor:hex=>{this.save.shirtColor=hex;this.player.setColor(hex);writeSave(this.save);this.hud.toast('Zmieniono kolor ubrania.');},
      onHome:()=>{this.player.position.copy(this.world.spawn);this.player.setPose('stand');this.camera.yaw=Math.PI;this.hud.toast('Jesteś przed swoim domem. Podejdź do drzwi.');},
      onTime:()=>{this.gameClock=(this.gameClock+.26)%1;this.hud.toast('Zmieniono porę dnia.');},
      onPause:()=>{if(!this.started)return;this.paused=!this.paused;this.hud.setPause(this.paused);},
    });
    this.renderer=new THREE.WebGLRenderer({
      canvas:this.hud.canvas,antialias:true,powerPreference:'high-performance',
    });
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.renderer.toneMapping=THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure=1.27;
    this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    this.world=new World();
    this.player=new Player(this.save.shirtColor);
    this.player.position.copy(this.world.spawn);
    this.world.scene.add(this.player.group);
    this.camera=new ThirdPersonCamera(this.hud.canvas);
    this.input=new Input();
    this.input.attachMobile(this.hud.mobileControls);
    this.input.bindInteract(()=>this.interact());
    this.changeQuality(this.save.quality);
    this.resize();
    window.addEventListener('resize',()=>this.resize());
    document.addEventListener('visibilitychange',()=>{if(document.hidden)this.clock.getDelta();});
    this.hud.startButton.addEventListener('click',()=>{
      if(this.started)return;
      this.started=true;this.paused=false;this.hud.start();
      this.clock.getDelta();
    });
    this.world.updateLight(this.gameClock,this.player.position);
    this.camera.update(1,this.player.position);
    this.renderer.render(this.world.scene,this.camera.camera);
    this.hud.update(this.save.coins,'08:15','OSIEDLE SŁONECZNE',this.player.position);
    this.hud.setPrompt(null);
    this.hud.ready();
    window.__nexoBootReady=true;
    this.animate();
  }
  private changeQuality(level:Quality):void {
    this.save.quality=level;
    const touch=matchMedia('(pointer:coarse)').matches;
    const profile:{[key in Quality]:{dpr:number;shadow:number}}={
      niska:{dpr:.78,shadow:0},
      srednia:{dpr:touch?1:1.2,shadow:touch?768:1024},
      wysoka:{dpr:touch?1.25:1.6,shadow:touch?1024:2048},
    };
    const selected=profile[level];
    this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,selected.dpr));
    this.renderer.shadowMap.enabled=selected.shadow>0;
    this.world.sun.castShadow=selected.shadow>0;
    if(selected.shadow>0){
      if(this.world.sun.shadow.map)this.world.sun.shadow.map.dispose();
      this.world.sun.shadow.mapSize.set(selected.shadow,selected.shadow);
      this.world.sun.shadow.needsUpdate=true;
    }
    this.renderer.setSize(innerWidth,innerHeight,false);
    this.hud.setQuality(level);
    writeSave(this.save);
  }
  private resize():void {
    this.renderer.setSize(innerWidth,innerHeight,false);
    this.camera.resize(innerWidth,innerHeight);
  }
  private interact():void {
    if(!this.started||this.paused)return;
    const item=this.world.nearestInteraction(this.player.position);
    if(!item){this.hud.toast('Podejdź do drzwi lub mebla, aby użyć interakcji.');return}
    const result=item.action();
    if(item.label.includes('Usiądź'))this.player.setPose('sit');
    if(item.label.includes('spać'))this.player.setPose('sleep');
    this.hud.toast(result);
  }
  private animate=():void=>{
    requestAnimationFrame(this.animate);
    const dt=Math.min(this.clock.getDelta(),.045);
    if(this.started&&!this.paused){
      this.elapsed+=dt;
      this.gameClock=(this.gameClock+dt/360)%1;
      const input=this.input.getMovement();
      this.player.update(dt,input,this.camera.yaw,this.world.getColliders());
      // Gracz nie opuszcza mapy prototypowej.
      this.player.position.x=THREE.MathUtils.clamp(this.player.position.x,-178,178);
      this.player.position.z=THREE.MathUtils.clamp(this.player.position.z,-178,178);
      this.world.update(dt,this.elapsed,this.player.position);
      this.world.updateLight(this.gameClock,this.player.position);
    }else{
      this.input.getMovement(); // Czyścimy pojedynczy skok, aby nie kumulował się w pauzie.
    }
    this.camera.update(dt||.016,this.player.position);
    this.renderer.render(this.world.scene,this.camera.camera);
    this.hudElapsed+=dt;
    if(this.hudElapsed>.16){
      this.hudElapsed=0;
      this.currentInteraction=this.started?this.world.nearestInteraction(this.player.position):null;
      this.hud.setPrompt(this.currentInteraction?.label||null);
      const hour=Math.floor(((this.gameClock+.25)%1)*24),minute=Math.floor((((this.gameClock+.25)%1)*24%1)*60);
      const label=String(hour).padStart(2,'0')+':'+String(minute).padStart(2,'0');
      const inside=Math.abs(this.player.position.x-this.world.house.x)<9.2&&Math.abs(this.player.position.z-this.world.house.z)<8.1;
      this.hud.update(this.save.coins,label,inside?'TWÓJ DOM':'NEXO VALLEY',this.player.position);
    }
    this.frame++;
    if(this.started)window.__nexoDebug={
      position:[this.player.position.x,this.player.position.y,this.player.position.z],
      doorOpen:this.world.house.getColliders().length===this.world.house.collisions.length,
      frame:this.frame,
    };
  };
}
declare global {
  interface Window {
    __nexoBootReady?:boolean;
    __nexoDebug?:{position:number[];doorOpen:boolean;frame:number};
  }
}
