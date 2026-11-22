# NEXO LIFE RP 4.0 — World Reimagined

**Niezależna, proceduralna gra przeglądarkowa 3D, całkowicie z kodu.** Nie wymaga Blendera ani ręcznego tworzenia modeli 3D. Nie jest produktem Roblox/Brookhaven i nie kopiuje ich assetów.

## Zagraj

**https://nexo-life-rp.vercel.app**

**Repozytorium:** https://github.com/stronezrobie-hub/nexo-city-3d

Projekt Vercel jest połączony z gałęzią `main` GitHuba — każda zatwierdzona aktualizacja automatycznie uruchamia nowe wdrożenie.

## Nowości w Alpha 4.0

- Nowy, nowoczesny ekran startowy i przeprojektowany interfejs gry (HUD, menu, minimapa, komunikaty, panel misji).
- Proceduralne niebo renderowane shaderem, nowe oświetlenie, dynamiczne cienie.
- Materiały trawy, drogi i chodników generowane z kodu przy użyciu CanvasTexture; bez zewnętrznych tekstur.
- Bardziej szczegółowe samochody: karoserie, szyby, zderzaki, reflektory, felgi, lusterka, detale nadwozia.
- Bardziej naturalne drzewa, parki z fontannami, kwiaty, rabaty, ławki i ogródki.
- Oświetlenie ulic nocą z lokalnymi dynamicznymi światłami.
- Kamera z obracaniem myszą/przeciągnięciem na ekranie dotykowym i zoomem kółkiem.
- Tryb fotograficzny klawiszem `O` lub przyciskiem aparatu; zamykanie również przez przycisk na ekranie.
- Nazwy dzielnic i zegar w grze.
- Ustawienia jakości w telefonie gry: Wydajność, Auto, Ultra. Profil Wydajność ogranicza rozdzielczość i wyłącza cienie.
- Poprawiona minimapa z linią do celu i wyróżnieniem pozycji gracza.
- Nowa ikona strony, metadane udostępniania.

## Funkcje RP

- Własna postać: ubiór, kolor skóry i włosów, imię, biografia.
- Spacer, sprint, emotki, plecak i proceduralne przedmioty.
- Zwierzęta: pies i kot.
- 4 rodzaje pojazdów, jazda, klakson, generowany dźwięk silnika.
- Domy: zajęcie, wnętrze, elewacja i ustawienia RP.
- Szkoła, szpital, policja, straż pożarna, bank, sklep, kawiarnia, stacja paliw.
- Prace, wypłaty, zadania dostawcze.
- Deszcz, mgła, dzień/noc, ruch uliczny, NPC.
- Zapisywanie stanu w localStorage.

## Sterowanie

| Sterowanie | Akcja |
| --- | --- |
| WASD / strzałki | Spacer lub jazda |
| Shift | Sprint |
| E | Interakcja, samochód, dom |
| F | Telefon |
| C | Zmiana kamery |
| H | Klakson w pojeździe |
| P / Esc | Pauza |
| O | Tryb fotograficzny |
| Przeciąganie po świecie | Obracanie kamery |
| Kółko myszy | Zoom |

Na telefonach dostępne są dotykowe przyciski poruszania, interakcji i kamery.

## Instalacja lokalna

W katalogu repozytorium uruchom:

```bash
python -m http.server 8080
```

Następnie otwórz http://localhost:8080. Three.js jest ładowany jako biblioteka JS z CDN, więc wymagane jest połączenie internetowe.

## Ważne ograniczenia

- Alpha 4.0 jest **single-player**. Nie ma multiplayera, serwera ani czatu.
- Stan gry zapisuje się **lokalnie w konkretnej przeglądarce** (localStorage), a nie w chmurze.
- Ustawienia drzwi mają wyłącznie charakter RP, nie stanowią mechanizmu uprawnień dla innych graczy.
- Modele są zbudowane proceduralnie, więc mimo ulepszeń nie jest to fotorealistyczna gra klasy AAA.
- Składnia JavaScript i wdrożenia Vercel są sprawdzane; pełne testy interakcji i płynności w różnych przeglądarkach są osobnym krokiem.

© NEXO Studios.
