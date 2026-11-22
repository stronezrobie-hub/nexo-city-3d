# NEXO LIFE RP — Alpha 2.0

Autorska gra WEB 3D typu life roleplay, inspirowana koncepcją swobodnego życia w mieście. Cały świat, postacie, samochody, drzewa i budynki są generowane z brył przez kod JavaScript i Three.js — bez modelowania i gotowych assetów graficznych.

## 🎮 Gra online

https://nexo-life-rp.vercel.app

Kod źródłowy: https://github.com/stronezrobie-hub/nexo-city-3d

Zmiany w gałęzi `main` uruchamiają automatyczne wdrożenia do Vercel (projekt: `nexo-life-rp`).

## Co działa

- Otwarta mapa miasta low-poly 3D, budynki i parki generowane proceduralnie.
- Własna postać, spacer, bieg i personalizacja stroju.
- Wsiadanie do samochodu, wysiadanie i prowadzenie auta.
- Ruch uliczny i postacie NPC.
- Domy: wybór, zajęcie, wejście do wnętrza i wyjście.
- Budynki miejskie: sklep, szpital, szkoła, komisariat, kawiarnia, salon samochodowy.
- Zawody, wypłata co 60 sekund aktywnej gry (poza mieszkańcem).
- Dostawy, gotówka, minimapa, dzień/noc i kamera z góry.
- Telefon z zakładkami: postać, pojazdy, praca, domy.
- Przyciski dotykowe i lokalny zapis pieniędzy, stroju, zawodu oraz posiadanego domu.

## Sterowanie

| Klawisz | Funkcja |
|---|---|
| WASD / strzałki | Chodzenie lub jazda |
| Shift | Sprint postaci |
| E | Interakcja / wsiadanie / wysiadanie / domy |
| F | Telefon |
| C | Zmiana kamery |
| P / Escape | Pauza |

Na telefonie działają przyciski ekranowe.

## Uruchomienie lokalne

Gra jest pojedynczym plikiem `index.html`, bez kompilowania. Otwórz katalog projektu w terminalu i uruchom:

```bash
python -m http.server 8080
```

Następnie przejdź do `http://localhost:8080`. Biblioteka Three.js jest wczytywana z CDN, więc potrzebne jest połączenie z internetem.

## Ograniczenia wersji Alpha

To jest wersja **single-player**, bez multiplayera, czatu sieciowego i serwerowego zapisu kont. Dane zapisują się wyłącznie w `localStorage` aktualnej przeglądarki. Jazda używa uproszczonej fizyki, a wnętrza domów są współdzielonym proceduralnym szablonem. Niezależna gra; nie jest produktem Roblox ani Brookhaven.

© NEXO Studios.
