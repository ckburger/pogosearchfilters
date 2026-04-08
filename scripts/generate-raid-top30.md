# generate-raid-top30.mjs

Scrapes the Top 30 Raid Attackers per type from [db.pokemongohub.net](https://db.pokemongohub.net/de/pokemon-list/best-per-type) and writes the result to `scripts/pogo-raid-top30.json`.

## Voraussetzungen

- Node.js 18 oder neuer
- Playwright installiert (nur einmalig nötig):

```bash
npm install playwright
npx playwright install chromium
```

## Ausführen

```bash
node scripts/generate-raid-top30.mjs
```

Das Script öffnet einen headless Chromium-Browser, ruft für alle 18 Typen die jeweilige Seite auf und extrahiert die Top-30-Liste. Die Laufzeit beträgt ca. 1–2 Minuten.

## Ausgabe

Die Datei `scripts/pogo-raid-top30.json` wird erstellt oder überschrieben. Struktur:

```json
{
  "generated": "2026-04-08",
  "source": "https://db.pokemongohub.net/de/pokemon-list/best-per-type",
  "note": "★ markiert Legacy-Attacken",
  "types": {
    "fire": [
      {
        "rank": 1,
        "name": "Mega Lohgock",
        "dex": 257,
        "fastAttack": "Feuerwirbel",
        "chargedAttack": "Lohekanonade ★"
      }
    ],
    "water": [ ... ],
    ...
  }
}
```

### Felder je Pokémon

| Feld            | Beschreibung                                      |
|-----------------|---------------------------------------------------|
| `rank`          | Platzierung innerhalb des Typs (1–30)             |
| `name`          | Deutscher Name (inkl. Mega/Crypto-Präfix)         |
| `dex`           | Pokédex-Nummer                                    |
| `fastAttack`    | Schnellattacke (★ = Legacy Move)                  |
| `chargedAttack` | Ladeattacke (★ = Legacy Move)                     |

### Enthaltene Typen

Normal, Kampf, Flug, Gift, Boden, Gestein, Käfer, Geist, Stahl, Feuer, Wasser, Pflanze, Elektro, Psycho, Eis, Drache, Unlicht, Fee

## Wann neu generieren?

Das Script sollte nach folgenden Ereignissen erneut ausgeführt werden:

- Neue Pokémon oder Mega-Entwicklungen wurden in Pokémon GO eingeführt
- Attacken-Rebalancing hat die Ranglisten verändert
- Legacy Moves wurden als reguläre Attacken freigegeben

## Hinweise

- **Sprache:** Pokémon- und Attackennamen sind auf Deutsch (Quelle ist die deutsche Version von pokemongohub.net).
- **Legacy Moves:** Attacken, die im Spiel nur noch über Events oder Elite-TMs erhältlich sind, werden mit `★` gekennzeichnet.
- **Mega- und Crypto-Pokémon** erscheinen in der Liste mit ihrem vollen Namen und teilen die Pokédex-Nummer mit ihrer Basisform.
