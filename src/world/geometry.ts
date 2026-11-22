import * as THREE from 'three';
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const cache = new Map<string, THREE.MeshStandardMaterial>();
export function material(color: number, roughness = .86): THREE.MeshStandardMaterial {
  const key = color + ':' + roughness;
  let m = cache.get(key);
  if (!m) { m = new THREE.MeshStandardMaterial({ color, roughness }); cache.set(key, m); }
  return m;
}
export function box(
  parent: THREE.Object3D, x: number, y: number, z: number,
  w: number, h: number, d: number, m: THREE.Material, shadow = true,
): THREE.Mesh {
  const mesh = new THREE.Mesh(boxGeometry, m);
  mesh.position.set(x, y, z); mesh.scale.set(w, h, d);
  mesh.castShadow = shadow; mesh.receiveShadow = true;
  parent.add(mesh); return mesh;
}
export function sphere(parent: THREE.Object3D, x: number, y: number, z: number,
  radius: number, m: THREE.Material): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(radius, 1), m);
  mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true;
  parent.add(mesh); return mesh;
}
export function sign(label: string, width = 6, height = 1.45): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#1a4050'; ctx.fillRect(0, 0, 512, 128);
  ctx.fillStyle = '#adf5c1'; ctx.fillRect(0, 0, 512, 9);
  ctx.fillStyle = '#f5fffb'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = 'bold 47px Arial,sans-serif';
  ctx.fillText(label.toUpperCase(), 256, 70, 470);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }));
}
export function collides(x: number, z: number, rects: readonly {minX:number;maxX:number;minZ:number;maxZ:number}[], radius = .38): boolean {
  return rects.some(r => x + radius > r.minX && x - radius < r.maxX && z + radius > r.minZ && z - radius < r.maxZ);
}
