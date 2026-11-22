import type { GameSave, Quality } from '../core/types';
const KEY = 'nexo-life-rp-ts-v1';
const initial: GameSave = {
  version: 1, quality: 'srednia', coins: 5000, playerName: 'Mieszkaniec',
  shirtColor: 0x48a9ed,
};
/** Bezpieczny odczyt; brak localStorage nie blokuje gry. */
export function loadSave(): GameSave {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}') as Partial<GameSave>;
    const quality: Quality = ['niska', 'srednia', 'wysoka'].includes(raw.quality || '')
      ? raw.quality as Quality : 'srednia';
    return {
      version: 1, quality,
      coins: Number.isFinite(raw.coins) ? Math.max(0, Number(raw.coins)) : initial.coins,
      playerName: typeof raw.playerName === 'string' ? raw.playerName.slice(0, 24) : initial.playerName,
      shirtColor: typeof raw.shirtColor === 'number' ? raw.shirtColor : initial.shirtColor,
    };
  } catch { return { ...initial }; }
}
export function writeSave(save: GameSave): void {
  try { localStorage.setItem(KEY, JSON.stringify(save)); } catch { /* Tryb prywatny. */ }
}
