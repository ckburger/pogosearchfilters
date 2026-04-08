import { useMemo, useState } from 'react';
import type { PokemonSpecies, PogoType, PveEntry } from '../types';
import { POGO_TYPES, TYPE_COLORS } from '../types';
import { generateSearchString, countUniqueIds } from '../utils/searchString';
import { pveRankings } from '../utils/pveRankings';
import { SearchStringCard } from './SearchStringCard';

interface Props {
  pokemonData: PokemonSpecies[];
}

function TypeSection({
  type,
  entries,
  pokemonData,
}: {
  type: PogoType;
  entries: PveEntry[];
  pokemonData: PokemonSpecies[];
}) {
  const color = TYPE_COLORS[type];
  const ids = useMemo(() => entries.map(e => e.dex), [entries]);
  const searchString = useMemo(() => generateSearchString(ids, pokemonData), [ids, pokemonData]);
  const idCount = useMemo(() => countUniqueIds(ids, pokemonData), [ids, pokemonData]);
  const label = type.charAt(0).toUpperCase() + type.slice(1);

  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <SearchStringCard
        title={label}
        searchString={searchString}
        color={color}
        pokemonCount={entries.length}
        idCount={idCount}
      />
      <button
        onClick={() => setOpen(o => !o)}
        className="text-xs text-slate-500 hover:text-slate-300 text-left px-3 py-1 transition-colors"
      >
        {open ? '▲ Liste ausblenden' : '▼ Liste anzeigen'}
      </button>
      {open && (
        <div className="flex flex-col gap-1">
          {entries.map(({ dex, shadow, name, fastMove, chargedMove, fastLegacy, chargedLegacy }) => (
            <div key={`${dex}-${shadow}`} className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-800/50">
              <span className="text-slate-500 font-mono text-xs w-9 shrink-0">#{dex}</span>
              <span className="text-sm text-slate-300 shrink-0">{name}</span>
              {shadow && <span className="text-xs text-purple-400 shrink-0">crypto</span>}
              <span className="text-xs text-slate-500 truncate">
                {fastMove}{fastLegacy ? '*' : ''} / {chargedMove}{chargedLegacy ? '*' : ''}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PveSection({ pokemonData }: Props) {
  const allPveIds = useMemo(
    () => Array.from(new Set(Object.values(pveRankings).flat().map(e => e.dex))),
    [],
  );
  const combinedString = useMemo(
    () => generateSearchString(allPveIds, pokemonData),
    [allPveIds, pokemonData],
  );
  const combinedIdCount = useMemo(
    () => countUniqueIds(allPveIds, pokemonData),
    [allPveIds, pokemonData],
  );

  return (
    <div className="p-4 flex flex-col gap-3">
      <SearchStringCard
        title="All Raid Attackers (Combined)"
        searchString={combinedString}
        color="#f97316"
        pokemonCount={allPveIds.length}
        idCount={combinedIdCount}
      />
      {POGO_TYPES.map(type => (
        <TypeSection
          key={type}
          type={type}
          entries={pveRankings[type] ?? []}
          pokemonData={pokemonData}
        />
      ))}
    </div>
  );
}
