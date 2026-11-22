# NEXO LIFE RP 5.0 — City Stories

Autorska, proceduralna gra 3D w przeglądarce. Mechaniki swobodnego roleplay inspirowane gatunkiem gier miejskich RP. **Wszystkie modele, obiekty, elementy świata i efekty są generowane kodem** — bez Blendera i pobierania gotowych assetów 3D.

Gra jest **niezależnym projektem**. Nie jest częścią Brookhaven ani Roblox i nie kopiuje ich map, postaci ani modeli.

**GRA ONLINE:** https://nexo-life-rp.vercel.app

**KOD:** https://github.com/stronezrobie-hub/nexo-city-3d

## Wersja 5.0 — co działa

### Domy i osiedla
- Wybieranie parceli z katalogu lub podejście do domu w mieście.
- Cztery autorskie domy generowane kodem: klasyczny, nowoczesny, willa rodzinna, loft.
- Trzy style wnętrz: przytulny, luksusowy i gaming/neon.
- Zmiana kolorów elewacji i umowne zamykanie drzwi (tylko RP).
- Wchodzenie i wychodzenie z umeblowanego wnętrza.

### Garaż i samochody
- Dziesięć pojazdów: City Cruiser, Family SUV, Street Sport, Police Unit, City Taxi, Ambulance, Fire Rescue, Offroad Explorer, Delivery Van i Executive Sedan.
- Przywoływanie samochodu, jazda, wsiadanie i wysiadanie, lakier.
- Syreny świetlne pojazdów służb (L). Klakson (H), generowane dźwięki silnika.

### Miasto i odgrywanie ról
- **Swobodne RP bez obowiązkowych dostaw**; zadania kurierskie można włączyć w zakładce Praca.
- Przewodnik po mieście z możliwością szybkiego dotarcia do wybranego miejsca.
- Aktywności budynków: lekarz i badanie, komisariat, kawa w kawiarni, zakupy, lekcja, bank z wpłatami/wypłatami, stacja paliw, straż pożarna.
- Role i prace, profil RP z imieniem i biografią, gesty i animacje.
- Postać: zmiana skóry, włosów i stroju; przedmioty i zwierzęta.
- NPC, ulice, sygnalizacja, parki, deszcz, mgła, słońce, dzień i noc.

### Wygląd
- Interfejs, minimapa, kamera obracana myszą/dotykiem, zoom, tryb fotograficzny.
- Trzy profile jakości: Wydajność, Auto, Ultra.
- Niebo, materiały, modele i elementy dekoracyjne generowane programistycznie.

## Sterowanie

| Klawisz | Działanie |
| --- | --- |
| WASD / strzałki | Spacer lub jazda |
| Shift | Sprint |
| E | Interakcja / wsiadanie / domy / budynki |
| F | Telefon |
| C | Zmiana kamery |
| H | Klakson |
| L | Syrena pojazdu służb |
| P / Esc | Pauza |
| O | Tryb fotograficzny |
| Mysz lub palec | Obracanie kamery |
| Kółko myszy | Przybliżanie/oddalanie |

Na telefonach dostępne są ekranowe przyciski ruchu i interakcji.

## Uruchomienie lokalne

Wymagany Node.js:

```bash
npm install
npm run dev
```

Wersja produkcyjna:

```bash
npm run build
npm run preview
```

Gra korzysta z Three.js i Vite. Zewnętrzne assety graficzne nie są pobierane; Three.js jest dołączony do produkcyjnego bundla.

## Testy

`npm run build` sprawdza możliwość zbudowania gry. Test `tests/browser-smoke.cjs` używa Chromium/Playwright i obejmuje uruchomienie gry, wybór parceli i domu, ustawienie wnętrza, garaż, swobodne RP, dostawy oraz interakcje miejskie.

## Aktualne ograniczenia

- To **wersja jednoosobowa**. Nie ma kont użytkowników, serwera multiplayer, wspólnego czatu, znajomych ani synchronizacji graczy.
- Dane (dom, pojazd, profil, środki, zawód itd.) są zapisywane **tylko lokalnie w przeglądarce** w `localStorage`.
- Symulacja zamykania domu jest tylko mechaniczną konwencją RP, nie kontrolą dostępu innego gracza.
- Bank korzysta wyłącznie z lokalnej, wirtualnej waluty gry. Tankowanie i niektóre scenki są symulacjami RP.
- Świat ma autorską oprawę proceduralną i nie jest fotorealistycznym odpowiednikiem gier AAA.

© NEXO Studios.
