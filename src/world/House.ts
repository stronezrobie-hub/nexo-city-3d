import * as THREE from 'three';
import { box, material, sign } from './geometry';
import type { CollisionRect, GameInteraction } from '../core/types';

/** Jeden dom jest umieszczony bezpośrednio na mapie. Nie ma teleportacji ani ładowania sceny. */
export class House {
  readonly group = new THREE.Group();
  readonly entry: THREE.Vector3;
  readonly collisions: CollisionRect[] = [];
  readonly interactions: GameInteraction[] = [];
  readonly interior = new THREE.Group();
  private roof = new THREE.Group();
  private doorHinge = new THREE.Group();
  private doorOpened = false;
  private screenMaterial = new THREE.MeshStandardMaterial({ color: 0x152b3e, emissive: 0x236ab4, emissiveIntensity: .3 });
  private tvOn = false;
  private doorRect: CollisionRect;

  constructor(public readonly x: number, public readonly z: number) {
    this.group.position.set(x, 0, z);
    this.entry = new THREE.Vector3(x, 0, z - 9);
    const plaster = material(0xf1e7d2), brick = material(0xe8a77d),
      roof = material(0x465d70), glass = material(0x8bd7ee, .22),
      wood = material(0x8d6547), floor = material(0xb9a48b);
    // Fundament, ściany i oddzielone drzwi.
    box(this.group, 0, .22, 0, 20, .42, 18, material(0xb2bcc0));
    const wall = (lx: number, lz: number, w: number, d: number, m = plaster) => {
      box(this.group, lx, 3.2, lz, w, 6.4, d, m);
      this.collisions.push({ minX: x+lx-w/2, maxX: x+lx+w/2, minZ: z+lz-d/2, maxZ: z+lz+d/2 });
    };
    wall(-10, 0, .5, 18); wall(10, 0, .5, 18); wall(0, 9, 20, .5);
    wall(-5.85, -9, 8.3, .5); wall(5.85, -9, 8.3, .5);
    // Okna i dekoracje.
    for (const offset of [-6, 6]) {
      box(this.group, offset, 3.9, -9.31, 2.7, 2.25, .12, glass, false);
      box(this.group, offset, 2.65, -9.42, 3.1, .18, .26, wood);
      box(this.group, offset, 5.15, -9.42, 3.1, .14, .26, wood);
    }
    box(this.group, -10.38, 3.5, -1.5, .13, 2.7, 3.2, glass, false);
    box(this.group, 10.38, 3.5, -1.5, .13, 2.7, 3.2, glass, false);
    this.doorHinge.position.set(-1.65, 0, -9.08);
    box(this.doorHinge, 1.65, 1.8, 0, 3.3, 3.6, .24, wood);
    box(this.doorHinge, 2.86, 1.85, -.17, .16, .16, .18, material(0xf2d07d), false);
    this.group.add(this.doorHinge);
    this.doorRect = { minX:x-1.65, maxX:x+1.65, minZ:z-9.5, maxZ:z-8.55 };
    // Zadaszenie: znika tylko, gdy postać naprawdę jest wewnątrz.
    box(this.roof, -5.0, 7.15, 0, 11.3, .38, 19, roof).rotation.z = .30;
    box(this.roof, 5.0, 7.15, 0, 11.3, .38, 19, roof).rotation.z = -.30;
    box(this.group, 0, 6.34, -9.10, 20.8, .3, .6, brick);
    this.group.add(this.roof, this.interior);
    const entrance = sign('DOM 01 · WNĘTRZE', 8, 1.25);
    entrance.position.set(0, 5.65, -9.5); this.group.add(entrance);
    // Wnętrze mieści się na tej samej pozycji świata co dom.
    box(this.interior, 0, .49, 0, 19, .12, 17, floor, false);
    for (let i = -8; i <= 8; i += 2) box(this.interior, i, .56, 0, .025, .015, 16.2, material(0xa78b76), false);
    // Przejścia do kuchni/sypialni — bez zbędnych kolizji w pierwszym etapie.
    box(this.interior, 0, 2.8, 1.2, 12, 5.1, .22, plaster);
    for(const offset of [-4.8, 4.8]) box(this.interior, offset, 2.2, 1.5, 2.1, 3, .22, glass, false);
    // Kanapa i niski stolik.
    const teal = material(0x459cad), dark = material(0x284b56);
    box(this.interior, -4.2, 1.16, -3.0, 4.2, .92, 1.8, teal);
    box(this.interior, -4.2, 2.0, -2.28, 4.2, 1.3, .4, teal);
    box(this.interior, -4.2, .72, -5.4, 2.35, .38, 1.5, wood);
    for (const xx of [-5.1,-3.3]) for (const zz of [-4.9,-5.9])
      box(this.interior, xx, .3, zz, .16, .55, .16, dark, false);
    box(this.interior, -4.2, 2.7, -8.57, 4.4, 2.7, .18, dark, false);
    box(this.interior, -4.2, 2.7, -8.75, 4.05, 2.32, .07, this.screenMaterial, false);
    // Kuchnia i lodówka.
    for (const xx of [-7.3,-5.1,-2.9]) {
      box(this.interior, xx, 1.1, 5.1, 2.0, 2.1, 1.35, material(0xd7e6db));
      box(this.interior, xx, 2.22, 5.1, 2.1, .15, 1.44, wood);
    }
    box(this.interior,-8.15,2.1,7.5,1.9,4.1,1.8,material(0xe1edf1));
    box(this.interior,-8.0,2.25,6.48,.22,.16,.20,dark,false);
    box(this.interior,-6.2,2.6,8.42,3,2.4,.15,glass,false);
    // Sypialnia i szafa.
    box(this.interior,5.0,.73,5.0,4.4,.95,5.6,wood);
    box(this.interior,5.0,1.3,5.0,4.1,.4,5.35,material(0xf0e9d9));
    box(this.interior,5.0,1.59,7.04,4,.15,1.3,material(0x7cc2dd),false);
    box(this.interior,8.1,2.6,7.6,1.55,4.4,2.0,material(0x9c7755));
    // Łazienka, umywalka i prysznic.
    box(this.interior,7.7,.27,-1.1,3.0,.21,2.7,material(0xcde1e7));
    box(this.interior,8.77,2.2,-1.3,.12,3.9,2.8,glass,false);
    box(this.interior,7.1,3.9,-1.4,2.4,.2,.2,material(0x94a5aa),false);
    const light = new THREE.PointLight(0xffe3b7, 18, 18); light.position.set(0, 5.2, 0);
    this.interior.add(light);
    this.interactions.push(
      { label:'Otwórz drzwi',position:new THREE.Vector3(x,0,z-9),radius:3.1,
        action:()=>{this.toggleDoor();return this.doorOpened?'Drzwi otwarte. Możesz wejść do środka.':'Drzwi zamknięte.';} },
      { label:'Usiądź na kanapie',position:new THREE.Vector3(x-4.2,0,z-3),radius:2.4,
        action:()=> 'Usiadłeś na kanapie. Naciśnij ruch, aby wstać.' },
      { label:'Włącz telewizor',position:new THREE.Vector3(x-4.2,0,z-7.1),radius:2.3,
        action:()=>{this.tvOn=!this.tvOn;this.screenMaterial.emissiveIntensity=this.tvOn?1.8:.3;return this.tvOn?'Telewizor włączony.':'Telewizor wyłączony.';} },
      { label:'Otwórz lodówkę',position:new THREE.Vector3(x-8,0,z+6.5),radius:2.5,
        action:()=> 'Znalazłeś coś do jedzenia w lodówce.' },
      { label:'Połóż się spać',position:new THREE.Vector3(x+5,0,z+4.8),radius:2.4,
        action:()=> 'Odpoczywasz w łóżku. Energia odzyskana!' },
      { label:'Weź prysznic',position:new THREE.Vector3(x+7.8,0,z-1.5),radius:2.1,
        action:()=> 'Prysznic zakończony.' },
    );
  }
  getColliders(): CollisionRect[] {
    return this.doorOpened ? this.collisions : [...this.collisions, this.doorRect];
  }
  toggleDoor(): void {
    this.doorOpened = !this.doorOpened;
    this.doorHinge.rotation.y = this.doorOpened ? -1.55 : 0;
    this.interactions[0].label = this.doorOpened ? 'Zamknij drzwi' : 'Otwórz drzwi';
  }
  update(player: THREE.Vector3): void {
    const dx = player.x - this.x, dz = player.z - this.z;
    const inside = Math.abs(dx) < 9.3 && Math.abs(dz) < 8.2;
    this.roof.visible = !inside;
    this.interior.visible = inside || dx*dx + dz*dz < 58*58;
  }
}
