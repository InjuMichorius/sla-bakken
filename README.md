# Sla Bakken

Het hoedenspel voor **één telefoon**. Teams leveren elk geheime woorden aan, en raden elkaars woorden tijdens drie rondes: omschrijven, uitbeelden en één woord. Geen accounts, geen netwerk nodig voor het spel zelf — de hele staat leeft in het geheugen.

Gebouwd met **Expo SDK 57** + **Expo Router**. Draait op iOS, Android én web (statische export).

---

## Inhoudsopgave

- [Snel starten](#snel-starten)
- [Scripts](#scripts)
- [Hoe het spel werkt](#hoe-het-spel-werkt)
- [Features](#features)
- [Spelstructuur in het spel](#spelstructuur-in-het-spel)
- [Projectstructuur](#projectstructuur)
- [Technische architectuur](#technische-architectuur)
- [Testen](#testen)
- [Bouwen en deployen met EAS](#bouwen-en-deployen-met-eas)
- [Tech stack](#tech-stack)
- [Licentie](#licentie)

---

## Snel starten

### Vereisten

| Tool | Versie |
| --- | --- |
| Node.js | 22 (zie `.github/workflows/eas-update.yml`) |
| npm | wordt met Node 18+ meegeïnstalleerd |
| Expo Go | alleen voor de eerste keer op een fysiek apparaat |
| Xcode / Android Studio | alleen voor `npm run ios` / `npm run android` (lokale dev build) |

Er zijn **geen native mappen** (`ios/`, `android/`) in de repo. Die worden gegenereerd via Continuous Native Generation; configureer native gedrag in `app.json` en via config-plugins.

### Installeren en starten

```bash
npm install          # dependencies ophalen
npm start            # dev server + Metro
```

Na `npm start` krijg je een QR-code:

- **iOS/Android**: scan met de camera of de Expo Go-app (`slabakken://` is het deep-link scheme).
- **Web**: druk op `w` in de terminal, of open http://localhost:8081.

De app is ook meteel te openen op een tweede scherm (bv. een laptop naast de telefoon) — de layout centreert zichzelf tot 560px breed en schaalt mee.

### Platformen draaien

```bash
npm run ios          # expo run:ios  → lokale native dev build (vereist Xcode)
npm run android      # expo run:android → lokale native dev build (vereist Android Studio)
npm run web          # expo start --web → dev server voor de browser
```

> **Let op:** na het toevoegen van een bibliotheek met native code werkt Expo Go niet meer. Bouw dan een **development build** met `npm run ios` / `npm run android` of `eas build --profile development`.

### Handige Expo-commando's

```bash
npx expo install <package>   # altijd gebruiken i.p.v. npm add: lost SDK-compatibele versies op
npx expo install --fix       # repareert incompatibele versies
npx expo-doctor              # diagnose van dependency- en configproblemen
```

---

## Scripts

| Script | Wat het doet |
| --- | --- |
| `npm start` | Start de Expo dev server (Metro) voor alle platformen |
| `npm run ios` | `expo run:ios` — lokale iOS dev build |
| `npm run android` | `expo run:android` — lokale Android dev build |
| `npm run web` | `expo start --web` — web dev server |
| `npm test` | Draait de pure-logica tests van `scripts/game.test.ts` via een eigen Node TS-loader |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | `expo lint` (ESLint 9 + `eslint-config-expo`) |
| `npm run verify` | `test` + `typecheck` + `lint` in één keer — **dit is de gate die CI gebruikt** |

---

## Hoe het spel werkt

### Het idee

Een groep speelt met **één gedeelde telefoon**. Het spel bestaat uit een **setupfase**, een **woord-invoerfase** en daarna **drie rondes**. Binnen elke ronde wisselen teams elke beurt van speler, net als bij het echte hoedenspel.

### 1. Setup — wie speelt mee?

Een wizard van drie stappen:

1. **Team 1** — naam aanpassen, spelers toevoegen/verwijderen/hernoemen (DiceBear-avatar per speler).
2. **Team 2** — idem.
3. **Instellingen** — zie hieronder.

| Instelling | Opties | Default |
| --- | --- | --- |
| Woorden per speler | 1 – 10 (stepper) | **5** |
| Seconden per beurt | 30 · 45 · 60 · 90 · 120 (chips) | **60** |
| Rondes | vast 3 | 3 |

Naamlimieten: teamnaam max. 24 tekens, spelersnaam max. 10 tekens.

Minimum om te kunnen starten: **2 teams × 2 spelers = 4 mensen** (`isSetupValid` in `src/game/reducer.ts:85`).
De wizard is bewust vastgeschroefd op 2 teams (`TOTAL_STEPS = 3` in `src/app/index.tsx:22`); de reducer ondersteunt meer teams (`ADD_TEAM` / `REMOVE_TEAM`) en wint met `MIN_TEAMS = 2`, maar de UI biedt die acties niet aan.

### 2. Woorden invoeren — de geheime woorden

Elke speler levert persoonlijk woorden aan voor **zijn/haar eigen team**. De telefoon wordt daarbij om de beurt doorgegeven: het scherm toont eerst "Geef de telefoon aan <naam>", pas na "Ik heb de telefoon" verschijnen de invoervelden. Zo ziet niemand de woorden van een ander.

Per speler:

- **1 tot 10 woorden** invoeren, minimaal **1** om verder te mogen.
- Per veld een 🎲-knop om een **willekeurig woord uit de bank** te rollen (327 Nederlandse woorden, `src/game/wordBank.ts`). De roll slaat woorden over die al door deze of een andere speler zijn ingevuld; bij een uitgeputte pool valt hij terug op de hele bank. Rollen mag onbeperkt.
- De voortgang is zichtbaar als dots bovenin (kleur per team) en als badge "3 / 5 gevuld".

Als iedereen klaar is, begint ronde 1.

### 3. De drie rondes

Elke ronde gebruikt **allemaal** de ingevoerde woorden: de pot wordt bij het starten van elke ronde volledig opnieuw geschudd. Elk woord komt dus per ronde precies één keer aan bod.

| Ronde | Naam | Opdracht | Icon |
| --- | --- | --- | --- |
| 1 | **Omschrijven** | Omschrijf het woord — nooit het woord zelf, ook niet deels of per letter | 💬 |
| 2 | **Uitbeelden** | Beeld het woord uit — geen praten, mompelen of schrijven | ✋ |
| 3 | **Eén Woord** | Zeg exact één enkel woord als hint — geen zinnen, geen uitleg | ⚡ |

De regels van de ronde worden vóór elke ronde op een introductiescherm getoond, met de tussenstand van de vorige ronde (of een uitleg van hoe een beurt werkt bij ronde 1).

### 4. Een beurt spelen

Voor elke beurt is er een **handoff-scherm**: "Geef de telefoon aan <speler>" met het teamlabel en de opdracht van de ronde. Pas na "Start beurt" gaat de timer lopen — zodat niemand onnodig tijd verliest tijdens het doorgeven.

Tijdens de beurt (`src/app/play.tsx`):

- Het woord staat **extra groot** in het midden (46pt, `adjustsFontSizeToFit`, maximaal 3 regels).
- Een timer-ring toont de resterende tijd (`M:SS`), die bij ≤10 s geel en bij ≤5 s rood wordt.
- Drie acties:
  - **Goed** — het team heeft het woord geraden. **+1 punt**, het woord verdwijnt uit de pot, het volgende woord verschijnt direct.
  - **Pas** — het woord gaat terug in de pot (de hele pot wordt opnieuw geschud). **0 punten**, de timer loopt door.
  - **Beurt stoppen** — de beurt eindigt voortijdig; het onopgeloste woord gaat terug in de pot.

Wanneer de timer op 0 staat, wordt de beurt automatisch beëindigd via exact dezelfde code pad als "Beurt stoppen".

**Let op:** gokken gebeurt volledig menselijk. De speler in beurt drukt op "Goed" — er is geen spellingcontrole, fuzzy matching of timerbonus. Ook "Pas" kost geen punten en geen extra tijd.

### 5. Rotatie: wie is wanneer aan de beurt?

Teams wisselen **elke beurt** strikt af, en binnen een team wisselen de spelers:

```
2 teams × 2 spelers:  A1 → B1 → A2 → B2 → A1 → B1 → A2 → B2
```

Bij ongelijke teamgroottes blijft elke speler aan bod komen, doordat de spelerindex berekend wordt uit de **globale** beurtteller (`nextPoint`, `src/game/reducer.ts:77`):

```ts
const teamIndex  = (currentTeamIndex + 1) % teamCount;
const playerIndex = Math.floor(nextTurn / teamCount) % playerCount;
```

### 6. Scoren en winnaars

- **Exact +1 punt per goed geraden woord**, toegekend aan het team dat aan de beurt is. Meer snelheid levert niets op: geen snelheidsbonus, geen streak-multiplier, geen strafpunten voor passen of resterende tijd.
- Scores lopen **door over de rondes heen** op; na elke ronde zie je de tussenstand.
- Een ronde eindigt **zodra de pot leeg is** — daar is geen knop voor.
- Na ronde 3 wint het team met de hoogste score. Bij gelijkspel zijn er meerdere winnaars en toont de eindstand "Gewonnen met gelijkspel".
- De ranglijst gebruikt *standard competition ranking*: gelijke scores delen dezelfde plek (`1, 2, 2, 4`), met alfabetische volgorde als tiebreak zodat de weergave altijd deterministisch is.

### 7. Eindstand

Het samenvattingsscherm toont de winnaar(s), een **podium van de top 3** (🥇🥈🥉), de overige teams eronder, en vier stat-tiles: rondes gespeeld, woorden in de pot, totaal geraden en seconden per beurt. "Nieuw spel" reset naar de setup — je instellingen (woorden per speler, tijd per beurt) blijven behouden.

---

## Features

**Gameplay**

- 3 vaste rondes met elk een eigen mechaniek en een eigen regelscherm
- Strikte team-alternatie, met rotatie van alle spelers ook bij ongelijke teamgroottes
- Configureerbare pot: 1–10 woorden per speler, timer 30/45/60/90/120 s
- Passen ("Pas") zonder straf, met reshuffle van de pot
- Volledige pot-reset per ronde — elke ronde een nieuwe start
- Gelijkspel-detectie met meerdere winnaars
- Live tussenstand, timer-ring met waarschuwingszones, scorebalken met teamkleuren
- Geen netwerk, geen accounts, geen data die het apparaat af verlaat

**Spelers & input**

- Teams en spelers aanmaken, hernoemen en verwijderen (met bevestigingsdialoog)
- DiceBear-avatar's (stijl `toon-head`, seed uit team- + spelersnaam), met fallback naar initialen op de teamkleur als de afbeelding niet laadt
- Woorden intypen óf random rollen uit een bank van 327 Nederlandse woorden
- Doorgeven-de-telefoon- schermen zodat niemand andermans woorden ziet

**UI/UX**

- Donker thema (`#0B0E14`) met accent `#FFC53D`, 8 teamkleuren die modulair door de lijst heen doorlopen
- **Haptische feedback** via `expo-haptics`, gekoppeld aan gebeurtenissen: navigatie = light, start = medium, goed geraden = success, pas = warning
- Content gecentreerd tot 560px met safe-area-insets → werkt van kleine telefoon tot desktop
- Fade-transities tussen schermen, custom bevestigingsdialoog (in plaats van `Alert`, want dat is een no-op op react-native-web)
- Uitgebreide `accessibilityRole` / `accessibilityLabel` / `accessibilityHint` op alle besturingselementen
- Keyboard: `KeyboardAvoidingView` op iOS, `keyboardShouldPersistTaps` zodat de velden klikbaar blijven
- Web-ondersteuning: eigen `+html.tsx` met `lang="nl"`, `viewport-fit=cover` en `theme-color`, plus pointer-cursors op alle interactieve elementen

**Kwaliteit**

- Volledig getypte game-logica in een pure reducer, met een testsuite van 419 regels
- Deadline-based timer die niet kan overslaan of bevriezen bij backgrounding
- Geen native mappen in de repo — Continuous Native Generation via `app.json`

---

## Spelstructuur in het spel

Elke speler levert woorden voor het eigen team; **het team dat het woord heeft ingediend, moet het ook raden**. Dat is bewust zo ontworpen: het is een onderlinge competitie binnen je eigen ploeg, en het voorkomt dat één speler alle woorden levert en de rest alleen toeschouwer is.

```
 setup        teams + spelers + instellingen
    ↓
 wordEntry    per speler: woorden intypen of rollen (pot size = Σ woorden)
    ↓
 ┌── roundIntro   regels van de ronde + tussenstand
 │      ↓
 │   handoff      "geef de telefoon aan <speler>" — timer staat uit
 │      ↓
 │   playing      GOED (+1, volgend woord) · PAS (terug in pot) · timer 0 → beurt einde
 │      ↓
 └── roundReview  pot leeg → tussenstand → volgende ronde (of eindstand na ronde 3)
    ↓
 summary     winnaar(s), podium, stats
```

---

## Projectstructuur

```
src/
├── app/                    # Expo Router — elk bestand is een scherm
│   ├── _layout.tsx         # root layout, GameProvider, phase → route mapping
│   ├── +html.tsx           # custom HTML root voor web
│   ├── index.tsx           # route /         → setup-wizard
│   ├── words.tsx           # route /words    → woorden invoeren (+ handoff)
│   ├── round.tsx           # route /round    → introductie per ronde
│   ├── play.tsx            # route /play     → handoff, spelen én ronde-overzicht
│   └── summary.tsx         # route /summary  → eindstand
├── components/             # AppButton, Avatar, Badge, ConfirmDialog,
│                           # QuitGameButton, RoundIcon, Screen, Standings
├── game/                   # pure, framework-vrije spel-logica
│   ├── constants.ts        # tunable waarden + de definitie van de 3 rondes
│   ├── types.ts            # GameState, Phase, initialGameState
│   ├── reducer.ts          # gameReducer: 20 actions, rotatie, pot, scores
│   ├── useGame.ts          # useReducer + memo's + context value
│   ├── GameProvider.tsx    # context provider
│   ├── wordBank.ts         # 327 Nederlandse woorden
│   ├── randomWord.ts       # pickRandomWord(used)
│   └── colors.ts           # teamColor(index), 8 kleuren
├── lib/haptics.ts          # haptische feedback, fail-safe
└── theme.ts                # kleuren, spacing, radius, gedeelde styles

scripts/
├── game.test.ts            # testsuite voor reducer/woordenbank/standings
├── ts-loader.mjs           # registreert de TS-resolver
└── ts-hooks.mjs            # lost extensionless imports op (Metro-stijl)
```

---

## Technische architectuur

### De reducer is de enige bron van waarheid

Alle spelstatus zit in één `useReducer` (`src/game/useGame.ts:49`), zonder persistence-middleware en zonder dependency. Er is geen AsyncStorage, MMKV of localStorage in het project — **een spel overleeft het afsluiten van de app of herladen van de webbundel dus niet**. Alleen `RESET` (een zachte reset binnen dezelfde sessie) behoudt `turnSeconds` en `wordsPerPlayer`.

Dat de app geen persistentie heeft, is geen ongeval maar een ontwerpkeuze: het spel bestaat uit geheime woorden die je niet op schijf wilt laten staan, en de hele flow is "telefoon doorgeven en spelen". De quit-dialoog zegt dit expliciet: *"De teams, woorden en scores van dit spel verdwijnen."*

### Navigatie wordt afgeleid van de fase

In plaats van dat schermen zelf `router.push()`en, bepaalt de reducer de fase en wordt de route daarop afgeleid (`src/app/_layout.tsx:14`):

```ts
const ROUTE_FOR_PHASE: Record<Phase, string> = {
  setup: '/',          wordEntry: '/words',     roundIntro: '/round',
  handoff: '/play',    playing: '/play',        roundReview: '/play',
  summary: '/summary',
};
```

Een `PhaseRouter` in de layout doet `router.replace(target)` zodra de fase verandert. De URL kan daardoor nooit uit sync raken met de spelstatus, en de back-stack bouwt zich niet op. Let op: `handoff`, `playing` en `roundReview` delen alle drie `/play` — die fase wordt binnen dat scherm opgesplitst.

### De 20 actions

```
SET_TURN_SECONDS  SET_WORDS_PER_PLAYER  ENSURE_DEFAULT_TEAMS
ADD_TEAM           REMOVE_TEAM            RENAME_TEAM
ADD_PLAYER         RENAME_PLAYER          REMOVE_PLAYER
START_WORD_ENTRY   SET_PLAYER_WORDS       START_GAME
START_ROUND        START_TURN
CORRECT_GUESS      PASS_GUESS             TICK
END_TURN           END_ROUND              NEXT_ROUND
RESET
```

Enkele guards die het gedrag bepalen:

- `START_WORD_ENTRY` doet niets als de setup ongeldig is; `START_GAME` doet niets als er geen woorden zijn.
- `SET_TURN_SECONDS` klemt naar 15–300 s (ruimer dan de UI-opties) en reset meteen `timerRemaining`.
- `SET_PLAYER_WORDS` is idempotent: het vervangt alle woorden van die speler, dus opnieuw opslaan kan nooit duplicaten maken.

### De pot

`pot` is een geshuffelde wachtrij waarbij **het laatste element het huidige woord is** (`popCurrent` / `redraw`, `src/game/reducer.ts:46`). Twee gevolgen:

- `wordsLeft` telt het **huidige** woord mee → het scherm begint een ronde op "20 van 20 in de pot".
- Bij *passen* of *beurt stoppen* gaat het woord terug in de pot en wordt de **hele pot opnieuw geschudd** — hetzelfde woord kan dus direct terugkomen.

`shuffle` is een handgeschreven Fisher-Yates op `Math.random()` (niet crypto, niet `just-instagrammed` deterministisch). De pot is **niet** gededupliceerd: twee spelers die hetzelfde woord typen, leveren twee keer een punt op.

### Deadline-based timer

De timer is geen afteller die elke tick decrementiert, maar een **deadline**:

```ts
const remaining = Math.max(
  0,
  state.turnSeconds - Math.floor((action.now - state.timerStartedAt) / 1000),
);
```

`timerStartedAt` is een `Date.now()`-stempel. Het scherm pollt elke 200 ms; bij 0 dispatcht `TICK` recursief `END_TURN`, waardoor een verlopen timer en de knop "Beurt stoppen" gegarandeerd hetzelfde pad volgen en een beurt nooit dubbel kan eindigen. Omdat vanaf wall-clock-tijd wordt berekend, kan de timer door backgrounding niet bevriezen of overslaan — hij loopt in de achtergrond gewoon door, en bij terugkomen in de app rekent de eerstvolgende tick de verstreken tijd alsnog in.

### Ranking

`rankStandings` (`src/game/reducer.ts:338`) sorteert op score (aflopend) met `name.localeCompare` als tiebreak en hanteert competition ranking (`1,2,2,4`) in plaats van dense ranking (`1,2,2,3`). `isWinner` is `score === best`, dus alle gelijkspel-teams zijn winnaar — dat sluit aan op de `winners`-lijst die `END_ROUND` opbouwt.

### Extensiepunten

| Wil je… | Raak dan aan |
| --- | --- |
| Een 4e ronde toevoegen | `ROUNDS` in `src/game/constants.ts` **én** de hardcoded `3` in `END_ROUND` (`reducer.ts:283`) |
| Meer teams in de UI | De wizard in `src/app/index.tsx` (`TOTAL_STEPS`, `currentTeam`) — reducer en `ADD_TEAM` ondersteunen het al |
| Eigen woordencategorieën | `WORD_BANK` is een platte `string[]`; voeg structuur toe of splits het bestand per thema |
| Geluidseffecten | `expo-audio` is al geïnstalleerd en in `app.json` geregistreerd, maar nergens geïmporteerd |
| Timerwaarden aanpassen | `TURN_SECONDS_OPTIONS` (UI) + de clamp in `reducer.ts:93` |
| Besturing toevoegen | `types.ts` (vraag de beurt met hints) → `reducer.ts` (nieuwe actions) → `useGame.ts` (exposeer in de context) |

---

## Testen

De game-logica is framework-vrij en daarom rechtstreeks in Node te testen — geen Jest, geen React Native runtime, geen watch-modus. De tests draaien op Node met een eigen loader (`scripts/ts-loader.mjs` + `ts-hooks.mjs`) die TypeScript en de extensionless imports van Metro afhandelt.

```bash
npm test          # alleen de tests
npm run verify    # tests + typecheck + lint, zoals in CI
```

`scripts/game.test.ts` (419 regels, `node:assert` + `node:test`) dekt:

- teams/spelers aanmaken, hernoemen, verwijderen en de setup-validatie
- de volledige beurtrotatie (ook met ongelijke teamgroottes)
- potgedrag: correct raden verwijdert, passen en beurt-einde leggen terug
- ronde-afsluiting, score-cumulatie over rondes, eindstand en gelijkspel
- `NEXT_ROUND` blijft binnen de drie rondes, `RESET` behoudt de instellingen
- de woordenbank (uniek, lowercase, schoon) en de randomizer (slaat gebruikte woorden over)
- de ranglijst (gelijke scores delen een plek)

---

## Bouwen en deployen met EAS

Native builds en releases draaien in de cloud — lokaal Xcode of Android Studio is niet nodig. Het EAS-project is `inju/sla-bakken`.

```bash
npx eas-cli@latest login
npx eas-cli@latest build --profile development   # dev build voor het apparaat
npx eas-cli@latest build --profile preview       # interne release
npx eas-cli@latest build --profile production    # productie, met autoIncrement
npx eas-cli@latest submit --profile production
```

Profielen staan in `eas.json`:

| Profiel | Doel |
| --- | --- |
| `development` | development client, interne distributie |
| `preview` | interne release |
| `production` | productie, `autoIncrement` op buildnummers |

### OTA-updates

`.github/workflows/eas-update.yml` publiceert bij elke push naar `main` automatisch een **EAS Update** naar kanaal `production`: install → `expo lint` → `tsc --noEmit` → `bunx eas-cli update --auto --non-interactive --channel production`. De workflow gebruikt Bun (`oven-sh/setup-bun@v2`) met `bun install --frozen-lockfile`.

Daarom: **JS-only wijzigingen hoeven geen nieuwe store-build** — zolang er geen native code of config-plugin verandert, wordt je update binnen enkele minuten uitgerold. Eén kanttekeling: de workflow installeert met `bun install --frozen-lockfile`, terwijl de repo op dit moment alleen `package-lock.json` bevat en geen `bun.lock` — controleer die combinatie vóór je op `main` pusht.

### Web-deploy

`app.json` zet `web.output` op `static` (pre-rendered). `npx expo export --platform web` levert een statische bundle in `dist/`, geschikt voor elke statische host (bv. GitHub Pages, Vercel, Netlify).

---

## Tech stack

| Package | Versie | Rol |
| --- | --- | --- |
| `expo` | ~57.0.26 | SDK-basis |
| `expo-router` | ~57.0.24 | File-based routing, `Stack`, web HTML root |
| `expo-haptics` | ~57.0.3 | Haptische feedback |
| `expo-audio` | ~57.0.5 | Geïnstalleerd, nog niet gebruikt |
| `expo-asset`, `expo-constants`, `expo-linking` | ~57 | SDK-modules, voorgekeken door Expo |
| `expo-status-bar` | ~57.0.1 | Statusbalk (altijd licht) |
| `react` / `react-dom` | 19.2.3 | UI-runtime |
| `react-native` | 0.86.3 | Native runtime |
| `react-native-web` | ^0.21.2 | Webtarget |
| `react-native-safe-area-context` | ~5.7.0 | Safe areas |
| `react-native-screens` | ~4.26.0 | Native stack-primitieven |
| `react-native-svg` | 15.15.4 | SVG-rendering van de iconen |
| `lucide-react-native` | ^1.49.0 | Iconenset |
| `typescript` | ~6.0.3 | TypeScript, `strict` |
| `eslint` + `eslint-config-expo` | ^9.39.5 / ~57.0.2 | Linting |

TypeScript draait in `strict`-modus met de path-alias `@/*` → `src/*`.

---

## Licentie

Zie [LICENSE](./LICENSE).
