import type { Vector3 } from 'three';

/** Dane zapisywane lokalnie – później może je obsługiwać API. */
export type Quality = 'niska' | 'srednia' | 'wysoka';
export interface GameSave {
  version: 1;
  quality: Quality;
  coins: number;
  playerName: string;
  shirtColor: number;
}
export interface CollisionRect {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  id?: string;
}
export interface GameInteraction {
  label: string;
  position: Vector3;
  radius: number;
  action(): string;
}
export interface MoveInput { forward: number; right: number; run: boolean; jump: boolean; }
