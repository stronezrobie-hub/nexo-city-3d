import type { Quality } from '../core/types';
interface Actions {
  onQuality(q:Quality):void;
  onColor(hex:number):void;
  onHome():void;
  onTime():void;
  onPause():void;
}
const COLORS=[0x48a9ed,0xf29076,0x82bf8d,0xb691db,0xe6ca74,0x4d566c];

/** Polski HUD odłączony od Three.js — można go przebudować bez zmiany silnika. */
export class Hud {
  readonly root:HTMLElement;
  private prompt:HTMLElement;
  private toastBox:HTMLElement;
  private map:HTMLCanvasElement;
  private balance:HTMLElement;
  private clockLabel:HTMLElement;
  private zone:HTMLElement;
  private panel:HTMLElement;
  private panelId='';
  private timer=0;
  constructor(root:HTMLElement,private actions:Actions){
    this.root=root;
    const markup=[
      '<div class="screen-root"><canvas id="game-canvas" aria-label="Świat NEXO LIFE RP"></canvas>',
      '<div class="soft-vignette"></div><div class="game-hud">',
      '<header class="topbar"><div class="brand"><span class="logo">N</span><span><b>NEXO LIFE RP</b><small>NOWY SILNIK · ETAP 1</small></span></div>',
      '<div class="top-actions"><div class="money"><small>TWÓJ PORTFEL</small><b id="balance">5 000 $</b></div>',
      '<div class="time"><span>☀</span><b id="clock-label">08:00</b></div>',
      '<button id="time-button" title="Zmień porę dnia">🌇</button>',
      '<button id="pause-button" title="Wstrzymaj grę">Ⅱ</button></div></header>',
      '<div class="world-badge"><span class="ping"></span>NEXO VALLEY<strong id="world-status">OSIEDLE SŁONECZNE</strong></div>',
      '<section class="minimap"><div class="map-label"><span>MAPA MIASTA</span><b>↗ N</b></div><canvas id="minimap" width="164" height="164"></canvas></section>',
      '<div id="context-prompt" class="context-prompt" hidden><kbd>E</kbd><span>Interakcja</span></div>',
      '<div id="message" class="toast-message" aria-live="polite"></div>',
      '<div class="control-hint"><b>🚶 SPACER PO MIEŚCIE</b><small>WASD — ruch · Mysz — kamera · E — użyj · Spacja — skok · Shift — bieg</small></div>',
      '<nav class="dock" aria-label="Menu gry">',
      '<button data-panel="dom"><span>🏠</span><b>Dom</b></button>',
      '<button data-panel="postac"><span>👤</span><b>Postać</b></button>',
      '<button data-panel="mapa"><span>🗺️</span><b>Mapa</b></button>',
      '<button data-panel="grafika"><span>💎</span><b>Grafika</b></button>',
      '<button data-panel="pomoc"><span>❔</span><b>Pomoc</b></button></nav>',
      '<aside id="menu-panel" class="menu-panel" hidden></aside>',
      '<section id="mobile-controls" class="mobile-controls" aria-label="Sterowanie dotykowe">',
      '<div class="dpad"><button data-control="up" class="up" aria-label="Przód">▲</button>',
      '<button data-control="left" class="left" aria-label="Lewo">◀</button>',
      '<button data-control="down" class="down" aria-label="Tył">▼</button>',
      '<button data-control="right" class="right" aria-label="Prawo">▶</button></div>',
      '<div class="touch-actions"><button data-control="run" aria-label="Bieg">🏃</button>',
      '<button data-control="jump" aria-label="Skok">⬆</button>',
      '<button data-control="interact" aria-label="Interakcja">E</button></div></section></div>',
      '<div id="start-screen" class="start-screen"><div class="welcome">',
      '<div class="overline"><span class="ping"></span>NEXO STUDIOS · NOWY SILNIK TYPESCRIPT</div>',
      '<div class="welcome-logo">NEXO <em>LIFE RP</em></div>',
      '<h1>Twoje miasto.<span>Twoja historia.</span></h1>',
      '<p>Kolorowy świat 3D, swobodny spacer i pierwszy dom z prawdziwym wnętrzem. Wszystko od nowa — w 100% z kodu.</p>',
      '<div class="welcome-chips"><span>🏡 Dom bez ładowania</span><span>🎮 PC i telefon</span><span>🌇 Dzień i noc</span></div>',
      '<button id="start-button" class="start-button" disabled>Ładowanie miasteczka…</button>',
      '<small id="start-status">Przygotowywanie świata 3D…</small></div></div></div>'
    ];
    root.innerHTML=markup.join('');
    this.prompt=root.querySelector('#context-prompt')!;
    this.toastBox=root.querySelector('#message')!;
    this.map=root.querySelector('#minimap')!;
    this.balance=root.querySelector('#balance')!;
    this.clockLabel=root.querySelector('#clock-label')!;
    this.zone=root.querySelector('#world-status')!;
    this.panel=root.querySelector('#menu-panel')!;
    root.querySelector('#time-button')!.addEventListener('click',actions.onTime);
    root.querySelector('#pause-button')!.addEventListener('click',actions.onPause);
    root.querySelectorAll<HTMLButtonElement>('[data-panel]').forEach(btn=>btn.addEventListener('click',()=>this.togglePanel(btn.dataset.panel!)));
    this.panel.addEventListener('click',event=>{
      const b=(event.target as HTMLElement).closest<HTMLButtonElement>('button');
      if(!b)return;
      if(b.dataset.close){this.closePanel();return}
      if(b.dataset.quality)this.actions.onQuality(b.dataset.quality as Quality);
      if(b.dataset.color)this.actions.onColor(Number(b.dataset.color));
      if(b.dataset.home){this.actions.onHome();this.closePanel();return}
      this.renderPanel();
    });
  }
  get canvas():HTMLCanvasElement{return this.root.querySelector('#game-canvas')!}
  get startButton():HTMLButtonElement{return this.root.querySelector('#start-button')!}
  get mobileControls():HTMLElement{return this.root.querySelector('#mobile-controls')!}
  ready():void{
    this.startButton.disabled=false;this.startButton.textContent='▶ WEJDŹ DO MIASTA';
    this.root.querySelector('#start-status')!.textContent='Miasto gotowe. Miłej gry!';
  }
  start():void{
    this.root.querySelector('#start-screen')!.classList.add('hidden');
    this.toast('Witaj w NEXO VALLEY! Podejdź do domu i naciśnij E.');
  }
  error(message:string):void{
    this.startButton.disabled=true;this.startButton.textContent='Nie udało się uruchomić gry';
    this.root.querySelector('#start-status')!.textContent=message;
  }
  update(coins:number,time:string,zone:string,p:{x:number,z:number}):void{
    this.balance.textContent=coins.toLocaleString('pl-PL')+' $';
    this.clockLabel.textContent=time;this.zone.textContent=zone;
    this.drawMap(p.x,p.z);
  }
  setPrompt(label:string|null):void{
    this.prompt.hidden=!label;
    if(label)this.prompt.querySelector('span')!.textContent=label;
  }
  toast(message:string):void{
    this.toastBox.textContent=message;this.toastBox.classList.add('show');
    window.clearTimeout(this.timer);
    this.timer=window.setTimeout(()=>this.toastBox.classList.remove('show'),3200);
  }
  setPause(paused:boolean):void{
    this.root.querySelector('#pause-button')!.textContent=paused?'▶':'Ⅱ';
    this.toast(paused?'Gra wstrzymana. Naciśnij ▶, aby wrócić.':'Wracasz do miasta.');
  }
  setQuality(q:Quality):void{this.root.dataset.quality=q}
  private togglePanel(id:string):void{
    if(this.panelId===id&&!this.panel.hidden){this.closePanel();return}
    this.panelId=id;this.renderPanel();
  }
  private closePanel():void{
    this.panel.hidden=true;this.panelId='';
    this.root.querySelectorAll<HTMLButtonElement>('[data-panel]').forEach(b=>b.classList.remove('active'));
  }
  private renderPanel():void{
    this.panel.hidden=false;
    this.root.querySelectorAll<HTMLButtonElement>('[data-panel]').forEach(b=>b.classList.toggle('active',b.dataset.panel===this.panelId));
    const heading=(name:string,lead:string)=>'<div class="menu-head"><div><small>NEXO LIFE RP · ETAP 1</small><h2>'+name+'</h2></div><button data-close="1">✕</button></div><p>'+lead+'</p>';
    const tile=(icon:string,name:string,desc:string,action='')=>'<div class="menu-item"><div class="menu-icon">'+icon+'</div><div><b>'+name+'</b><small>'+desc+'</small></div>'+action+'</div>';
    if(this.panelId==='dom'){
      this.panel.innerHTML=heading('🏠 Twój pierwszy dom','Wchodzisz do środka bez teleportacji i ekranu ładowania. Podejdź do drzwi i użyj E.')+
        tile('🚪','Drzwi','Otwórz je przyciskiem E.')+
        tile('🛋️','Wnętrze','Salon, kuchnia, sypialnia, łazienka i meble z interakcjami.')+
        '<button class="wide-button" data-home="1">📍 Przejdź pod dom</button>'+
        '<div class="panel-note">10+ domów, piętra, budowanie i własność — kolejny etap.</div>';
    }else if(this.panelId==='postac'){
      this.panel.innerHTML=heading('👤 Postać','Wybierz kolor ubrania. Zmiana zapisze się w przeglądarce.')+
        '<div class="swatches">'+COLORS.map(hex=>'<button data-color="'+hex+'" aria-label="Kolor ubrania" style="background:#'+hex.toString(16).padStart(6,'0')+'"></button>').join('')+'</div>'+
        tile('🏃','Animacje','Stanie, chodzenie, bieg, skakanie i siadanie.');
    }else if(this.panelId==='mapa'){
      this.panel.innerHTML=heading('🗺️ Mapa miasta','Spaceruj po osiedlu i centrum. Gra działa na jednej mapie 3D.')+
        tile('🏠','Dom 01','Północno-wschodnia część centrum.','<button data-home="1">IDŹ</button>')+
        tile('🌳','Park','Fontanna, alejki i ławki.')+
        tile('🏥','Budynki','Szpital, sklep, szkoła, policja i stacja paliw.');
    }else if(this.panelId==='grafika'){
      const quality=this.root.dataset.quality||'srednia';
      const values:{id:Quality;name:string;details:string}[]=[
        {id:'niska',name:'⚡ Niska',details:'Mniejsza rozdzielczość i bez dynamicznych cieni'},
        {id:'srednia',name:'🌿 Średnia',details:'Płynność i miękkie cienie'},
        {id:'wysoka',name:'✨ Wysoka',details:'Lepsza ostrość i dokładniejsze cienie'},
      ];
      this.panel.innerHTML=heading('💎 Ustawienia grafiki','Wybierz jakość obrazu do wydajności swojego urządzenia.')+
        values.map(q=>tile('🎮',q.name,q.details,'<button data-quality="'+q.id+'" '+(quality===q.id?'disabled':'')+'>'+(quality===q.id?'WYBRANA':'USTAW')+'</button>')).join('')+
        '<div class="panel-note">Cel: 60 FPS na średnim sprzęcie. Rzeczywistą płynność trzeba sprawdzić na konkretnym urządzeniu.</div>';
    }else{
      this.panel.innerHTML=heading('❔ Sterowanie','Poznaj podstawy NEXO LIFE RP.')+
        tile('⌨️','Klawiatura','WASD — ruch · Shift — bieg · Spacja — skok · E — użyj.')+
        tile('🖱️','Kamera','Przeciągnij myszą lub palcem. Kółko zmienia przybliżenie.')+
        tile('📱','Telefon','Dotykowy krzyżak oraz przyciski E, skoku i biegu.');
    }
  }
  private drawMap(x:number,z:number):void{
    const ctx=this.map.getContext('2d');if(!ctx)return;
    const w=164,s=.36;
    ctx.fillStyle='#a6d3a0';ctx.fillRect(0,0,w,w);
    const project=(v:number,center:number)=>w/2+(v-center)*s;
    ctx.strokeStyle='#4b5661';ctx.lineWidth=12;
    for(const line of [-75,0,75]){
      ctx.beginPath();ctx.moveTo(project(line,x),0);ctx.lineTo(project(line,x),w);ctx.stroke();
      ctx.beginPath();ctx.moveTo(0,project(line,z));ctx.lineTo(w,project(line,z));ctx.stroke();
    }
    ctx.fillStyle='#f4b27e';ctx.fillRect(project(35,x)-5,project(35,z)-5,10,10);
    ctx.fillStyle='#3c7f8b';ctx.fillRect(project(-37,x)-5,project(35,z)-5,10,10);
    ctx.fillStyle='#cbff8c';ctx.strokeStyle='#123642';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(w/2,w/2-8);ctx.lineTo(w/2+6,w/2+6);ctx.lineTo(w/2-6,w/2+6);ctx.closePath();
    ctx.fill();ctx.stroke();
  }
}
