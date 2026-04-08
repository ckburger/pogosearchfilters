import { useMemo } from 'react';
import type { PvpLeague, PokemonSpecies, FetchedData, PvpEntry } from '../types';
import { LEAGUE_LABELS, LEAGUE_COLORS } from '../types';
import { generateSearchString, countUniqueIds } from '../utils/searchString';
import { SearchStringCard } from './SearchStringCard';

interface Props {
  league: PvpLeague;
  fetched: FetchedData | null;
  isFetching: boolean;
  fetchError: string | null;
  pokemonData: PokemonSpecies[];
  onRefresh: () => void;
}

export function AutoLeagueSection({
  league, fetched, isFetching, fetchError, pokemonData, onRefresh,
}: Props) {
  const ids: PvpEntry[] = fetched?.[league] ?? [];
  const regularDexIds = useMemo(() => ids.filter(e => !e.shadow).map(e => e.dex), [ids]);
  const shadowDexSet = useMemo(() => new Set(ids.filter(e => e.shadow).map(e => e.dex)), [ids]);
  const allDexIds = useMemo(() => ids.map(e => e.dex), [ids]);
  const color = LEAGUE_COLORS[league];
  const label = LEAGUE_LABELS[league];

  const searchString = useMemo(
    () => generateSearchString(regularDexIds, pokemonData, shadowDexSet),
    [regularDexIds, shadowDexSet, pokemonData],
  );
  const idCount = useMemo(() => countUniqueIds(allDexIds, pokemonData), [allDexIds, pokemonData]);

  if (isFetching) {
    return (
      <div className="p-6 flex flex-col items-center gap-3 text-slate-400">
        <div className="w-6 h-6 border-2 border-slate-600 border-t-slate-300 rounded-full animate-spin" />
        <p className="text-sm">Fetching data from PvPoke…</p>
      </div>
    );
  }

  if (!fetched && fetchError) {
    return (
      <div className="p-6 flex flex-col items-center gap-3">
        <p className="text-sm text-red-400">{fetchError}</p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!fetched) {
    return (
      <div className="p-6 flex flex-col items-center gap-3 text-slate-400">
        <p className="text-sm">No data yet.</p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-slate-200"
        >
          Fetch Data
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <SearchStringCard
        title={label}
        searchString={searchString}
        color={color}
        pokemonCount={ids.length}
        idCount={idCount}
      />
      <div className="flex flex-col gap-1">
        {ids.map(({ dex, shadow }) => {
          const species = pokemonData.find(p => p.id === dex);
          return (
            <div key={dex} className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-800/50">
              <span className="text-slate-500 font-mono text-xs w-9 shrink-0">#{dex}</span>
              <span className="text-sm text-slate-300">{species?.nameEn ?? `#${dex}`}</span>
              {shadow && (
                <span className="text-xs text-purple-400">crypto</span>
              )}
              {species && species.nameDe !== species.nameEn && (
                <span className="text-xs text-slate-500">{species.nameDe}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
