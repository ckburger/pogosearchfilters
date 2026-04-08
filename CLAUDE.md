# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See [features.md](features.md) for a full description of what the app does.

## Commands

```bash
npm run dev              # Start dev server at http://localhost:5173/
npm run build            # TypeScript check + Vite production build → dist/
npm run preview          # Preview production build locally
npm run generate-data    # Regenerate src/data/pokemon.json from PokeAPI (~1-3 min)
```

## Architecture

**Purpose:** PWA that generates Pokémon GO search filter strings (by Pokédex number) for meta-relevant Pokémon. Hosted at `https://ckburger.github.io/pogosearchfilters/`.

### Data sources

| Category | Source | How |
|----------|--------|-----|
| GL / UL / ML | PvPoke GitHub rankings JSON | Fetched at runtime, top 100 per league |
| PVE (raids) | PvPoke GitHub game master | Fetched + computed at runtime, top 30 per type |
| Custom | User-managed | Stored in localStorage |

PvPoke base URL: `https://raw.githubusercontent.com/pvpoke/pvpoke/master/src/data`

- Rankings: `/rankings/all/overall/rankings-{1500|2500|10000}.json`
- Game master Pokémon: `/gamemaster/pokemon.json` — has `dex`, `speciesId`, `types`, `baseStats.atk`, `fastMoves`, `chargedMoves`, `tags`
- Game master moves: `/gamemaster/moves.json` — has `moveId`, `type`, `power`, `cooldown`

Shadow Pokémon have `_shadow` suffix in `speciesId` (e.g. `quagsire_shadow`). Same `dex` as regular form.

### PVE ranking computation

For each of the 18 types: filter Pokémon that have at least one fast/charge move of that type, score by `baseStats.atk × (1.2 if shadow) × (1.2 if STAB)`, deduplicate by `dex`, take top 30.

### Search string format

`#<dexNumber>` comma-separated (e.g. `#1,#2,#3`). Adding any Pokémon auto-includes its full evolution family via `src/data/pokemon.json`.

### State

Two localStorage keys:
- `pogo-fetched-v1` — cached `FetchedData` (GL/UL/ML arrays + PVE type map + `lastUpdated`)
- `pogo-custom-v1` — `CustomCategory[]` (user-created, each with name + pokemon ID array)

On first load, the app auto-fetches if no cached data exists. The **Refresh** button in the header re-fetches all PvPoke data.

### Combined filter

Union of all fetched GL + UL + ML IDs + all PVE type IDs + all custom category IDs, expanded through evolution chains.

### Export / Import

Only exports/imports custom categories (`pogo-custom-filters.json`). Fetched PVP/PVE data is re-fetchable.

## Key files

| Path | Role |
|------|------|
| `src/types.ts` | Shared types, `POGO_TYPES`, `TYPE_COLORS`, `LEAGUE_COLORS` |
| `src/services/pvpokeService.ts` | Fetches + computes all auto data from PvPoke |
| `src/hooks/useAppStore.ts` | All state: fetched cache, custom categories, refresh logic |
| `src/utils/searchString.ts` | `generateSearchString` + `countUniqueIds` |
| `src/components/AutoLeagueSection.tsx` | GL/UL/ML read-only tabs |
| `src/components/PveSection.tsx` | PVE tab, one `SearchStringCard` per type |
| `src/components/CustomSection.tsx` | User categories: create/rename/delete + add/remove Pokémon |
| `src/data/pokemon.json` | Bundled dataset: 1025 species with EN/DE names + evolution chains |
| `scripts/generate-pokemon-data.mjs` | One-time data generation script (run after new Pokémon releases) |
| `vite.config.ts` | `base: '/pogosearchfilters/'` for prod only; Tailwind v4 + PWA |

## Deployment

Push to `main` → `.github/workflows/deploy.yml` builds and deploys to GitHub Pages. Requires **GitHub Pages source set to GitHub Actions** in repo settings.
