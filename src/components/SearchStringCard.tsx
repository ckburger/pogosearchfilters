import { useState } from 'react';

interface Props {
  title: string;
  searchString: string;
  color: string;
  pokemonCount?: number;
  idCount?: number;
}

export function SearchStringCard({ title, searchString, color, pokemonCount, idCount }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!searchString) return;
    await navigator.clipboard.writeText(searchString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="font-semibold text-base" style={{ color }}>
            {title}
          </h3>
          {pokemonCount !== undefined && (
            <p className="text-xs text-slate-400 mt-0.5">
              {pokemonCount} {pokemonCount === 1 ? 'Pokémon' : 'Pokémon'} · {idCount} IDs in string
            </p>
          )}
        </div>
        <button
          onClick={copy}
          disabled={!searchString}
          className="shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      {searchString ? (
        <p className="font-mono text-xs text-slate-300 break-all leading-relaxed max-h-24 overflow-y-auto">
          {searchString}
        </p>
      ) : (
        <p className="text-sm text-slate-500 italic">No Pokémon added yet</p>
      )}
    </div>
  );
}
