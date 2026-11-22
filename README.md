# NEXO LIFE RP 3.0 — Realistic City Update

Autorska gra internetowa 3D typu **life roleplay**, rozwijana w 100% kodem, bez Blendera, ręcznego modelowania i gotowych assetów 3D. Mechaniki inspirowane otwartym RP, ale **to nie jest kopia Brookhaven ani gra Roblox**.

**Gra:** https://nexo-life-rp.vercel.app

**Repozytorium:** https://github.com/stronezrobie-hub/nexo-city-3d

**Wdrożenia:** GitHub `main` → Vercel, automatycznie.

## Aktualna wersja Alpha 3.0

### Świat i realizm
- Proceduralna mapa low-poly 3D, ulice, przejścia dla pieszych, chodniki, sygnalizacja świetlna.
- Domy, garaże, szyldy generowane w runtime, ławki, drzewa, chmury.
- Szkoła, szpital, komisariat, straż pożarna, bank, kawiarnia, sklep, salon aut, stacja paliw.
- Deszcz, mgła, słońce, ręczne przełączanie dnia i nocy.
- Postacie NPC, uproszczone poruszanie się innych samochodów.

### Roleplay
- Postać z kolorem ubrań, skóry i włosów, imieniem i biografią RP.
- Emotki: machanie, taniec, siadanie.
- Plecak: telefon, latarka, kawa, parasol, balon.
- Pupile podążające za postacią: pies i kot.
- Cztery rodzaje samochodów: miejski, SUV, sportowy i policyjny.
- Jazda, wysiadanie i wsiadanie, klakson i syntetyczny dźwięk silnika.
- Własny dom, wejście do umeblowanego wnętrza, zmiana koloru elewacji i flaga zamka RP.
- Prace, wypłaty i misje dostawcze, lokalny zapis postępu.

### Sterowanie
- WASD / strzałki — ruch i jazda
- E — interakcje / wsiadanie / wysiadanie / domy
- F — telefon
- C — kamera
- Shift — sprint
- H — klakson (w pojeździe)
- P / Esc — pauza

Telefon: ekranowe przyciski do jazdy/chodzenia, interakcji, kamery i klaksonu.

## Technologie

HTML, CSS, JavaScript i Three.js (ładowany z CDN). Geometria, kolory, szyldy (CanvasTexture), efekty i dźwięki (Web Audio API) są tworzone kodem. `index.html` stanowi komplet aktualnej aplikacji.

## Uruchamianie lokalne

```bash
python -m http.server 8080
```

Otwórz `http://localhost:8080`. Ładowanie Three.js wymaga internetu.

## Co jest jeszcze do zrobienia

Ta wersja **nie jest pełną odpowiedniczką Brookhaven**. Obecnie brak:
- prawdziwego multiplayera, serwera, wspólnego czatu i zapraszania znajomych,
- kont użytkowników i serwerowego zapisu postępów,
- zaawansowanej fizyki pojazdów i ruchu drogowego AI,
- pełnych wnętrz wszystkich budynków, edytora mebli, prywatnych parceli dla wielu graczy,
- animacji motion-capture, fotorealistycznych tekstur i pełnego świata AAA.

Niektóre mechaniki (jak blokowanie domu) służą **odgrywaniu ról w trybie jednoosobowym**, nie stanowią realnych zabezpieczeń przed innymi graczami. Gra zapisuje ustawienia przez `localStorage` w danej przeglądarce. Bez infrastruktury backendowej nie da się zrealizować wiarygodnego multiplayera.

© NEXO STUDIOS. Projekt niezależny od Roblox/Brookhaven.
