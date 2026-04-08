import { useMemo } from 'react';
import type { FetchedData, PokemonSpecies, PogoType } from '../types';
import { POGO_TYPES, TYPE_COLORS } from '../types';
import { generateSearchString, countUniqueIds } from '../utils/searchString';
import { SearchStringCard } from './SearchStringCard';

interface Props {
  fetched: FetchedData | null;
  isFetching: boolean;
  fetchError: string | null;
  pokemonData: PokemonSpecies[];
  onRefresh: () => void;
}

function TypeSection({
  type,
  ids,
  pokemonData,
}: {
  type: PogoType;
  ids: number[];
  pokemonData: PokemonSpecies[];
}) {
  const color = TYPE_COLORS[type];
  const searchString = useMemo(
    () => generateSearchString(ids, pokemonData),
    [ids, pokemonData],
  );
  const idCount = useMemo(() => countUniqueIds(ids, pokemonData), [ids, pokemonData]);
  const label = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <SearchStringCard
      title={label}
      searchString={searchString}
      color={color}
      pokemonCount={ids.length}
      idCount={idCount}
    />
  );
}

export function PveSection({ fetched, isFetching, fetchError, pokemonData, onRefresh }: Props) {
  if (isFetching) {
    return (
      <div className="p-6 flex flex-col items-center gap-3 text-slate-400">
        <div className="w-6 h-6 border-2 border-slate-600 border-t-slate-300 rounded-full animate-spin" />
        <p className="text-sm">Computing raid rankings…</p>
      </div>
    );
  }

  if (!fetched && fetchError) {
    return (
      <div className="p-6 flex flex-col items-center gap-3">
        <p className="text-sm text-red-400">{fetchError}</p>
        <button onClick={onRefresh} className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
          Retry
        </button>
      </div>
    );
  }

  if (!fetched) {
    return (
      <div className="p-6 flex flex-col items-center gap-3 text-slate-400">
        <p className="text-sm">No data yet.</p>
        <button onClick={onRefresh} className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-slate-200">
          Fetch Data
        </button>
      </div>
    );
  }

  const allPveIds = useMemo(
    () => Array.from(new Set(Object.values(fetched.pve).flat())),
    [fetched.pve],
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
          ids={fetched.pve[type] ?? []}
          pokemonData={pokemonData}
        />
      ))}
    </div>
  );
}
