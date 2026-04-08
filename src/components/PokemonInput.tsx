import { useState, useMemo, useRef } from 'react';
import type { PokemonSpecies } from '../types';

interface Props {
  pokemonData: PokemonSpecies[];
  existingIds: number[];
  onAdd: (id: number) => void;
  color: string;
}

export function PokemonInput({ pokemonData, existingIds, onAdd, color }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return pokemonData
      .filter(p =>
        p.nameEn.toLowerCase().includes(q) ||
        p.nameDe.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [query, pokemonData]);

  const select = (pokemon: PokemonSpecies) => {
    if (!existingIds.includes(pokemon.id)) {
      onAdd(pokemon.id);
    }
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Add Pokémon (EN or DE name)…"
        className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400 placeholder:text-slate-500"
        style={{ caretColor: color }}
      />
      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-xl overflow-hidden z-20 shadow-2xl">
          {suggestions.map(pokemon => {
            const added = existingIds.includes(pokemon.id);
            return (
              <button
                key={pokemon.id}
                onMouseDown={e => { e.preventDefault(); select(pokemon); }}
                disabled={added}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-700 disabled:opacity-50 text-left transition-colors"
              >
                <span className="text-slate-400 font-mono text-xs w-9 shrink-0">
                  #{pokemon.id}
                </span>
                <span className="font-medium">{pokemon.nameEn}</span>
                {pokemon.nameDe !== pokemon.nameEn && (
                  <span className="text-slate-400 text-xs">/ {pokemon.nameDe}</span>
                )}
                {added && (
                  <span className="ml-auto text-xs text-slate-500 shrink-0">Added</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
