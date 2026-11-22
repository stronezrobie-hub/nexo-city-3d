import { Game } from './core/Game';
import './styles/main.css';

const container=document.querySelector<HTMLElement>('#app');
if(!container)throw new Error('Nie znaleziono głównego elementu aplikacji.');
try {
  new Game(container);
} catch (error) {
  console.error('NEXO LIFE RP — błąd uruchomienia:',error);
  container.innerHTML='<div class="boot-failed"><h1>Nie udało się uruchomić gry</h1><p>Sprawdź, czy przeglądarka obsługuje WebGL 2 i ma włączoną akcelerację sprzętową.</p><button onclick="location.reload()">Odśwież stronę</button></div>';
}
