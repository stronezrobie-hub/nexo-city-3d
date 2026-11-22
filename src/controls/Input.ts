import type { MoveInput } from '../core/types';

/** Jedno źródło sterowania dla klawiatury i ekranu dotykowego. */
export class Input {
  private keys=new Set<string>();
  private touch=new Set<string>();
  private jumpQueued=false;
  private onInteract:()=>void=()=>{};
  constructor(){
    window.addEventListener('keydown',event=>{
      if(event.target instanceof HTMLElement&&event.target.closest('input,textarea,select'))return;
      if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.code))event.preventDefault();
      this.keys.add(event.code);
      if(event.code==='Space'&&!event.repeat)this.jumpQueued=true;
      if(event.code==='KeyE'&&!event.repeat)this.onInteract();
    });
    window.addEventListener('keyup',event=>this.keys.delete(event.code));
    window.addEventListener('blur',()=>{this.keys.clear();this.touch.clear();});
  }
  bindInteract(handler:()=>void):void{this.onInteract=handler;}
  attachMobile(root:HTMLElement):void {
    root.querySelectorAll<HTMLButtonElement>('[data-control]').forEach(button=>{
      const code=button.dataset.control!;
      const release=(event:PointerEvent)=>{
        this.touch.delete(code);
        if(button.hasPointerCapture(event.pointerId))button.releasePointerCapture(event.pointerId);
      };
      button.addEventListener('pointerdown',event=>{
        event.preventDefault();button.setPointerCapture(event.pointerId);
        if(code==='interact')this.onInteract();
        else if(code==='jump')this.jumpQueued=true;
        else this.touch.add(code);
      });
      button.addEventListener('pointerup',release);
      button.addEventListener('pointercancel',release);
      button.addEventListener('lostpointercapture',()=>this.touch.delete(code));
    });
  }
  getMovement():MoveInput {
    const press=(code:string,touch:string)=>this.keys.has(code)||this.touch.has(touch);
    const forward=Number(press('KeyW','up')||press('ArrowUp','up'))-Number(press('KeyS','down')||press('ArrowDown','down'));
    const right=Number(press('KeyD','right')||press('ArrowRight','right'))-Number(press('KeyA','left')||press('ArrowLeft','left'));
    const input={forward,right,run:this.keys.has('ShiftLeft')||this.keys.has('ShiftRight')||this.touch.has('run'),jump:this.jumpQueued};
    this.jumpQueued=false;return input;
  }
}
