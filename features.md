# Features

## Auto-fetched filters

On first load the app automatically fetches data from PvPoke. A **Refresh** button in the header re-fetches everything on demand.

### PVP leagues
- **Great League (GL)** — top 100 Pokémon ranked for 1500 CP
- **Ultra League (UL)** — top 100 Pokémon ranked for 2500 CP
- **Master League (ML)** — top 100 Pokémon ranked for 10000 CP

Each league tab shows the ranked list (read-only) and a copyable search string.

### PVE / Raids
- One search string per type for all **18 Pokémon types** (Bug, Dark, Dragon, …)
- Each type shows the **top 30 raid attackers** for that type, ranked by effective attack (base attack × STAB bonus × shadow bonus)
- A **combined PVE string** at the top of the tab unions all 18 type lists

## Custom categories

Users can create any number of named custom filter lists:
- **Add** a category with a custom name
- **Rename** a category by tapping its name
- **Delete** a category
- **Add Pokémon** via autocomplete (searches by English or German name)
- **Remove Pokémon** from a list

Each custom category generates its own copyable search string and is included in the combined filter.

## Combined filter

A card at the top of the app always shows the union of **all** categories: GL + UL + ML + all 18 PVE types + all custom categories. Consecutive Pokédex numbers are compressed into ranges (e.g. `100-106`).

## Search string format

- Uses Pokédex numbers without prefix (e.g. `1,4,7` not `#1,#4,#7`)
- Consecutive numbers are compressed into ranges: `1-3,7-9,25`
- Adding any Pokémon automatically includes its full evolution family in the string

## Export / Import (custom categories only)

- **Export all** — downloads `pogo-custom-filters.json` with all custom categories
- **Export single** — each category card has its own Export button, downloads one category as `pogo-filter-<name>.json`
- **Import** — accepts both single-category and all-categories files; always **merges** into existing lists (nothing is deleted)
- Use import/export to sync custom lists across devices

## PWA

Installable as a Progressive Web App. Works offline after first load (auto-fetched data is cached in `localStorage`; Pokémon dataset is bundled).
