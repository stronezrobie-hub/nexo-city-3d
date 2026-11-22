# NEXO LIFE RP — TypeScript / Prototyp 0.1

**Nowa, niezależna implementacja NEXO LIFE RP od zera**, oparta na Three.js, Vite i TypeScript. Projekt jest rozwijany w gałęzi \`rebuild/phase-1-typescript\` — stabilna gra z gałęzi \`main\` pozostaje bez zmian.

## Etap 1 — co działa

- Autorski proceduralny świat 3D: drogi, skrzyżowania, chodniki, zebra, park, budynki i osiedle.
- Jedna **w pełni wchodzona nieruchomość** (Dom 01) z czterema obszarami: salon, kuchnia, sypialnia i łazienka. Dom i pokoje są w **tej samej scenie 3D**, bez ekranu ładowania.
- Otwieranie/zamykanie drzwi przyciskiem E, kolizja z zamkniętymi drzwiami, ukrywanie dachu wewnątrz.
- Meble z działającymi interakcjami: sofa, telewizor, lodówka, łóżko, prysznic.
- Chodzenie postaci, bieg, skok, animacja ruchu i siadania; ruch względem kamery.
- NPC, ruch samochodów (uproszczony, dekoracyjny), instancje drzew i latarni.
- Polski interfejs: saldo, godzina, minimapa, panel domu, postać, mapa, grafika i pomoc.
- Sterowanie klawiaturą/myszą oraz dotykowe na telefonach.
- Cykl dzień/noc, mgła i miękkie cienie; trzy poziomy grafiki.
- Wersjonowany zapis podstawowych danych do localStorage: saldo, kolor ubrania, jakość.

**Poza zakresem etapu 1:** system pełnej własności/najmu i 10 wchodzonych domów, budowanie, dodatkowe piętro i schody, fizyka jazdy, misje, pełna ekonomia oraz multiplayer. Są to kolejne etapy; ta wersja nie udaje, że już je obsługuje.

## Uruchomienie (Windows 11, VS Code)

Zainstaluj **Node.js 22.12+** (Vite 8 wymaga też nowszej wersji Node 20.19+). Otwórz folder projektu w terminalu:

\`\`\`powershell
npm install
npm run dev
\`\`\`

Otwórz adres wskazany przez Vite, zwykle **http://localhost:5173**. Do korzystania na telefonie w tej samej sieci, otwórz adres LAN wskazany przez Vite (\`--host 0.0.0.0\`), jeżeli zapora i sieć pozwalają.

### Kontrola projektu

\`\`\`powershell
npm run typecheck
npm run build
npm run preview
\`\`\`

## Sterowanie

| Klawisz | Akcja |
|---|---|
| W/A/S/D lub strzałki | Chodzenie |
| Shift | Bieg |
| Spacja | Skok |
| E | Użyj przedmiotu / otwórz drzwi |
| Przeciągnij myszą/palcem | Obracanie kamery |
| Kółko myszy | Przybliżenie kamery |
| Menu Dom | Szybki powrót pod pierwszy dom |

## Moduły

- \`src/core/Game.ts\` — pętla gry, zarządzanie rendererem i jakością.
- \`src/world/World.ts\` — miasteczko, instancje roślin, ruch NPC i samochodów.
- \`src/world/House.ts\` — wchodzone wnętrze, drzwi, meble, interakcje.
- \`src/player/Player.ts\` — animowana postać, chodzenie, kolizje i grawitacja.
- \`src/camera/ThirdPersonCamera.ts\` — kamera trzecioosobowa.
- \`src/controls/Input.ts\` — PC i dotyk w jednym modelu.
- \`src/systems/Save.ts\` — bezpieczny adapter localStorage; w przyszłości backend.
- \`src/ui/Hud.ts\` — polski HUD, obsługa menu i minimapa.
- \`src/world/geometry.ts\` — proceduralne geometrie i współdzielone materiały.

## Etapy rozwoju

1. **Fundament** (ten prototyp): ruch, kamera, miasto, jeden dom.
2. **Domy**: dziesięć wchodzonych nieruchomości, kilka kondygnacji, budowanie, koszty i zaproszenia w obrębie rozgrywki lokalnej.
3. **Postać**: wygląd, akcesoria, emotki, głód, energia, telefon i plecak.
4. **Pojazdy**: samochody, motocykl, autobus, jazda, garaż i kupno.
5. **Roleplay i ekonomia**: prace, misje, sklep, płatności i profil.
6. **Optymalizacja**: system stref, LOD, culling wnętrz, profilowanie FPS na telefonach i komputerach.
7. **Backend i multiplayer**: Supabase/WebSocket, autorytatywny serwer, synchronizacja i zaproszenia między graczami.

**Wydajność:** 60 FPS na średnim sprzęcie jest celem, nie gwarancją. Optymalizacje obejmują instancing roślin, współdzielone geometrie, ograniczony DPR i ukrywanie niewidocznych wnętrz. Docelowa wydajność wymaga pomiarów WebGL na sprzęcie docelowym.

Projekt niezależny; nie zawiera modeli, map ani logotypów Brookhaven/Roblox.
