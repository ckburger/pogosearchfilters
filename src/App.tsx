import { useState, useMemo, useEffect } from 'react';
import pokemonDataRaw from './data/pokemon.json';
import type { PvpLeague, PokemonSpecies } from './types';
import { useAppStore } from './hooks/useAppStore';
import { generateSearchString, generateCryptoString, countUniqueIds, negateSearchString } from './utils/searchString';
import { pveRankings } from './utils/pveRankings';
import { SearchStringCard } from './components/SearchStringCard';
import { AutoLeagueSection } from './components/AutoLeagueSection';
import { PveSection } from './components/PveSection';
import { CustomSection } from './components/CustomSection';

const pokemonData = pokemonDataRaw as unknown as PokemonSpecies[];
type Tab = PvpLeague | 'pve' | 'custom';
const TABS: Tab[] = ['gl', 'ul', 'ml', 'pve', 'custom'];

const TAB_LABELS: Record<Tab, string> = {
  gl: 'GL', ul: 'UL', ml: 'ML', pve: 'PVE', custom: 'My Lists',
};

const TAB_COLORS: Record<Tab, string> = {
  gl: '#3b82f6', ul: '#8b5cf6', ml: '#eab308', pve: '#f97316', custom: '#10b981',
};

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>('gl');
  const {
    fetched, isFetching, fetchError, custom,
    refresh, addCategory, removeCategory, renameCategory,
    addPokemonToCategory, removePokemonFromCategory,
    exportCustom, exportCategory, importCustom,
  } = useAppStore();

  // Auto-fetch on first load if no cached data
  useEffect(() => {
    if (!fetched && !isFetching) refresh();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { combinedRegularIds, combinedShadowSet } = useMemo(() => {
    const regular = new Set<number>();
    const shadow = new Set<number>();
    if (fetched) {
      [...fetched.gl, ...fetched.ul, ...fetched.ml].forEach(e =>
        e.shadow ? shadow.add(e.dex) : regular.add(e.dex)
      );
    }
    Object.values(pveRankings).flat().forEach(e =>
      e.shadow ? shadow.add(e.dex) : regular.add(e.dex)
    );
    custom.forEach(cat => cat.pokemon.forEach(id => regular.add(id)));
    // if a dex appears as both regular and shadow, regular covers all forms
    shadow.forEach(dex => { if (regular.has(dex)) shadow.delete(dex); });
    return { combinedRegularIds: Array.from(regular), combinedShadowSet: shadow };
  }, [fetched, custom]);

  const combinedIds = useMemo(
    () => [...combinedRegularIds, ...Array.from(combinedShadowSet)],
    [combinedRegularIds, combinedShadowSet],
  );

  const combinedString = useMemo(
    () => generateSearchString(combinedRegularIds, pokemonData),
    [combinedRegularIds],
  );
  const combinedCryptoString = useMemo(
    () => generateCryptoString(combinedShadowSet, pokemonData),
    [combinedShadowSet],
  );
  const negatedString = useMemo(() => negateSearchString(combinedString), [combinedString]);
  const combinedIdCount = useMemo(
    () => countUniqueIds(combinedIds, pokemonData),
    [combinedIds],
  );

  const lastUpdated = fetched
    ? new Date(fetched.lastUpdated).toLocaleString()
    : null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-700 sticky top-0 bg-slate-900 z-10">
        <div>
          <h1 className="text-lg font-bold tracking-tight">PoGo Filters</h1>
          <p className="text-xs text-slate-500">
            v{__BUILD_DATE__}{lastUpdated && ` · ${lastUpdated}`}
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={isFetching}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg transition-colors"
        >
          <span className={isFetching ? 'animate-spin inline-block' : ''}>↻</span>
          {isFetching ? 'Fetching…' : 'Refresh'}
        </button>
      </header>

      {/* Combined search string */}
      <div className="px-4 pt-4">
        <SearchStringCard
          title="All Pokémon (Combined)"
          searchString={combinedString}
          color="#94a3b8"
          pokemonCount={combinedIds.length}
          idCount={combinedIdCount}
        />
        {combinedCryptoString && (
          <SearchStringCard
            title="All Pokémon (Crypto)"
            searchString={combinedCryptoString}
            color="#a855f7"
            pokemonCount={combinedShadowSet.size}
            idCount={combinedShadowSet.size}
          />
        )}
        <SearchStringCard
          title="Not in List"
          searchString={negatedString}
          color="#64748b"
          pokemonCount={combinedIds.length}
          idCount={combinedIdCount}
        />
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-slate-700 mt-4 sticky top-[57px] bg-slate-900 z-10">
        {TABS.map(tab => {
          const isActive = activeTab === tab;
          const count =
            tab === 'gl' ? (fetched?.gl.length ?? 0) :
            tab === 'ul' ? (fetched?.ul.length ?? 0) :
            tab === 'ml' ? (fetched?.ml.length ?? 0) :
            tab === 'pve' ? (fetched ? 18 : 0) :
            custom.length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 text-xs font-medium transition-colors relative"
              style={isActive ? { color: TAB_COLORS[tab] } : { color: '#94a3b8' }}
            >
              {TAB_LABELS[tab]}
              {count > 0 && (
                <span
                  className="ml-0.5 text-xs"
                  style={isActive ? { color: TAB_COLORS[tab] } : { color: '#64748b' }}
                >
                  {count}
                </span>
              )}
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: TAB_COLORS[tab] }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto pb-safe">
        {(activeTab === 'gl' || activeTab === 'ul' || activeTab === 'ml') && (
          <AutoLeagueSection
            league={activeTab}
            fetched={fetched}
            isFetching={isFetching}
            fetchError={fetchError}
            pokemonData={pokemonData}
            onRefresh={refresh}
          />
        )}
        {activeTab === 'pve' && (
          <PveSection
            pokemonData={pokemonData}
          />
        )}
        {activeTab === 'custom' && (
          <CustomSection
            categories={custom}
            pokemonData={pokemonData}
            onAdd={addCategory}
            onRemove={removeCategory}
            onRename={renameCategory}
            onAddPokemon={addPokemonToCategory}
            onRemovePokemon={removePokemonFromCategory}
            onExport={exportCustom}
            onExportCategory={exportCategory}
            onImport={importCustom}
          />
        )}
      </div>
    </div>
  );
}
