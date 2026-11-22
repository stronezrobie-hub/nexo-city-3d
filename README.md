# NEXO LIFE RP 7.0 — Graphics Edition

**Autorska, jednoosobowa gra 3D w przeglądarce. Cały świat powstaje z kodu, bez gotowych modeli 3D.** To niezależna produkcja, która rozwija mechaniki gatunku life RP; nie jest powiązana z Brookhaven ani Roblox.

**Zagraj:** https://nexo-life-rp.vercel.app

**GitHub:** https://github.com/stronezrobie-hub/nexo-city-3d

## Graphics 7.0 — realistyczniejszy świat, pełna regulacja jakości

**Pięć profili grafiki** dostępnych w menu **Graphics 7.0** oraz przez przycisk 💎 w górnym pasku:

| Poziom | Efekty renderowania |
| --- | --- |
| **Low** | niższa rozdzielczość, bez map cieni i ciężkich efektów |
| **Balanced** | podstawowe, miękkie cienie, optymalna rozdzielczość |
| **High** | dokładniejsze cienie, wyższa rozdzielczość i jakość materiałów |
| **Ultra** | cienie 2048 px, Bloom i mocniejsze refleksy na komputerze |
| **Ultra+** | cienie do 3072 px, Bloom i SSAO na komputerze |

Wydajność i rzeczywisty efekt zależą od GPU oraz przeglądarki. Na urządzeniach dotykowych kosztowne efekty postprocessingu są domyślnie wyłączone, aby chronić płynność. W razie długotrwałego spadku FPS w Ultra/Ultra+ gra może automatycznie przełączyć się na High; **F9** przywraca Balanced.

### Ulepszenia świata i efektów

- Shaderowe niebo, gwiazdy w nocy oraz cztery pory: **świt, dzień, zachód słońca, noc**.
- Dokładniejsze mapy miękkich cieni, cienie kontaktowe pod pojazdami.
- Zapisane w kodzie gradienty i proceduralne mapy materiałów (asfalt, trawa, chodniki) oraz proceduralne środowisko do stylizowanych odbić.
- Mokre drogi z kałużami podczas deszczu oraz zwiększony połysk asfaltu.
- Szkło o właściwościach fizycznych, rozświetlone okna i lampy uliczne nocą, światła auta.
- Poświata **Bloom** (Ultra/Ultra+ na PC) i cieniowanie przestrzenne **SSAO** (Ultra+ na PC).
- Dodatkowe elementy architektury: urządzenia dachowe, panele słoneczne, detale fasad.
- Bogatsze umeblowanie wnętrza, podświetlenie pomieszczeń i dekoracje.
- Animowane kręgi na wodzie w fontannach.
- Ustawienia zapisywane lokalnie; w panelu widoczny jest przybliżony FPS.

Efekty odbić to przybliżenia PBR i mapa otoczenia generowana kodem, **nie pełne ray tracing ani rzeczywiste odbicia screen-space**. Oprawa pozostaje autorską, stylizowaną grafiką 3D, nie fotorealizmem AAA.

### Testowanie

`npm run build` oraz `node tests/browser-smoke.cjs` sprawdzają grę. `node tests/graphics-smoke.cjs` weryfikuje podstawowe profile jakości i pory dnia. Pełen test na GPU z Ultra/Ultra+ uruchamiany jest opcjonalnie przez `GRAPHICS_STRESS=1 node tests/graphics-smoke.cjs`. W środowiskach bez sprzętowego WebGL tryby najwyższe mogą być bardzo wolne.

## RP Hub 6.2 — system inspirowany zrzutami ekranu

- **Witaj w NEXO VALLEY:** animowane, oryginalne powitanie uruchamiane po rozpoczęciu gry.
- **Aktualizacje:** czytelny panel nowości. Możesz go zamknąć i otworzyć ponownie przez przycisk aktualizacji.
- **Szybki panel RP po prawej:** edytor postaci, narzędzia, animacje, pojazdy i domy. Skróty otwierają istniejące funkcje gry, a nie puste makiety.
- **Animacje:** machanie, taniec, siadanie, salutowanie, radość oraz powrót do normalnej pozycji.
- **Rodzina RP:** własna nazwa rodziny i wybór roli (opiekun, dziecko, rodzeństwo, gość) z lokalnym zapisem. **Bez zapraszania innych graczy** — multiplayer nie jest jeszcze zaimplementowany.
- **Kamery domowe:** trzy przełączane widoki w świecie 3D (wejście, ogród, salon) dostępne po zajęciu domu. Są to symulowane kamery w grze, nie podgląd prawdziwych urządzeń.
- **Telefon:** nowości RP dostępne również jako pozycje menu wirtualnego telefonu.
- **Smartfony:** prawy panel skrótów można rozwinąć i zwinąć, by nie zasłaniał gry.
- Testy Chromium sprawdzają powitanie, aktualizacje, skróty RP, rodzinę, kamery, dotychczasowe mechaniki domów i pojazdów oraz układ mobilny.

Grafika nawiązuje funkcjonalnie do gatunku gier typu city roleplay, ale **nie używa logotypów, chronionych modeli ani materiałów z Brookhaven czy Roblox**.

## City Edition 6.1 — wygląd i obsługa

- **Nowe menu:** duży panel zakładek jest ukryty domyślnie, zastąpił go kompaktowy pasek dolny. Przycisk „Więcej” otwiera pełne menu dopiero na żądanie. Uspójniono również rozmieszczenie elementów na małych ekranach.
- **Drogi:** wyniesione krawężniki, malowane linie brzegowe i miejsca parkingowe.
- **Miasto:** fasady budynków mają dodatkowe szyby, ościeżnice, wejścia, ganki, schody, roślinność i przystanki.
- **Postać:** sylwetka 3D o bardziej naturalnych proporcjach, zaokrąglona głowa i ruchome kończyny, nadal generowane wyłącznie kodem.
- **Ulice:** zaparkowane samochody i prosty system reagowania ruchu NPC na fazy świateł.
- **Pogoda i noc:** poprawiona jasność i czytelność świata w trybie nocnym.
- **Testy mobilne:** kontrola, że główne menu nie zakrywa gry na małym ekranie.

To **stylizowany proceduralny realizm**, nie fotorealizm ani kopia Brookhaven/Roblox.

## Nowości w 6.0

- Chodzenie postacią w stylu trzecioosobowym, **WASD względem kamery** i płynne przesuwanie się wzdłuż przeszkód.
- **Szybki start jazdy:** z garażu możesz bezpośrednio wsiąść do wybranego samochodu.
- **Własne dekoracje domu:** roślina, lampa, regał, telewizor, fotel i biurko — maksymalnie 6 mebli jednocześnie.
- Dekoracje są generowane jako modele 3D w kodzie, zapisują się do `localStorage` i można je usuwać.
- Interakcje z dekoracjami w domu przyciskiem **E**: włączanie TV i lampy, odpoczynek w fotelu, czytanie i inne działania RP.
- **Szybkie wejście do własnego domu** bez chodzenia przez całe miasto.
- Nowe **mobilne menu skrótów**: Telefon, Domy, Pojazdy, RP oraz przycisk Więcej.

## Wcześniejsze funkcje

- Katalog 4 modeli domów, 3 style wnętrz i zmiana kolorów elewacji.
- 10 rodzajów pojazdów, pojazdy służb, światła syren, klakson.
- Role i zawody, zadania kurierskie opcjonalne, bank, kawiarnia, szpital, komisariat i inne aktywności miejskie.
- Postać, zwierzaki, przedmioty, animacje, profil RP.
- Miasto 3D, pogoda, NPC, ruch uliczny, minimapa i swobodna kamera.
- Zapisywanie postępów lokalnie w przeglądarce.

## Sterowanie

| Klawisz | Funkcja |
| --- | --- |
| WASD / strzałki | Chodzenie lub jazda |
| Shift | Sprint |
| E | Interakcja / wejście do auta / budynku / obsługa mebli |
| F | Telefon |
| C | Zmiana kamery |
| H | Klakson |
| L | Syrena pojazdów służb |
| P / Esc | Pauza |
| O | Tryb fotograficzny |

Mysz / dotyk na obszarze świata obraca kamerę, kółko myszy zmienia zoom.

## Uruchomienie

```bash
npm install
npm run dev
```

Test wydania:

```bash
npm run build
```

Automatyczny test Chromium (Playwright) w `tests/browser-smoke.cjs` sprawdza uruchomienie gry, wybór domu, dekorowanie, jazdę, dostawy i menu mobilne. CI jest w `.github/workflows/browser-smoke.yml`.

## Ważne ograniczenia

**Nie ma jeszcze multiplayera, czatu sieciowego ani kont użytkowników.** Zapis odbywa się przez `localStorage` na konkretnym urządzeniu. Zamki drzwi i niektóre aktywności to symulacje RP, a nie mechanizmy sieciowe. Ta gra ma stylizowaną, generowaną kodem grafikę, a nie fotorealistyczne zasoby AAA.

© NEXO Studios.
