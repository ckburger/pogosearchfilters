import { useState, useRef, useMemo } from 'react';
import type { CustomCategory, PokemonSpecies } from '../types';
import { generateSearchString, countUniqueIds } from '../utils/searchString';
import { SearchStringCard } from './SearchStringCard';
import { PokemonInput } from './PokemonInput';

interface Props {
  categories: CustomCategory[];
  pokemonData: PokemonSpecies[];
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onAddPokemon: (catId: string, speciesId: number) => void;
  onRemovePokemon: (catId: string, speciesId: number) => void;
  onExport: () => void;
  onExportCategory: (catId: string) => void;
  onImport: (file: File) => void;
}

function CategoryCard({
  cat, pokemonData, onRemove, onRename, onAddPokemon, onRemovePokemon, onExport,
}: {
  cat: CustomCategory;
  pokemonData: PokemonSpecies[];
  onRemove: () => void;
  onRename: (name: string) => void;
  onAddPokemon: (id: number) => void;
  onRemovePokemon: (id: number) => void;
  onExport: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(cat.name);

  const searchString = useMemo(
    () => generateSearchString(cat.pokemon, pokemonData),
    [cat.pokemon, pokemonData],
  );
  const idCount = useMemo(
    () => countUniqueIds(cat.pokemon, pokemonData),
    [cat.pokemon, pokemonData],
  );

  const submitRename = () => {
    if (nameInput.trim()) onRename(nameInput);
    setEditing(false);
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700">
      {/* Category header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700">
        {editing ? (
          <input
            autoFocus
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onBlur={submitRename}
            onKeyDown={e => { if (e.key === 'Enter') submitRename(); if (e.key === 'Escape') setEditing(false); }}
            className="flex-1 bg-slate-700 rounded-lg px-2 py-1 text-sm focus:outline-none"
          />
        ) : (
          <button
            onClick={() => { setNameInput(cat.name); setEditing(true); }}
            className="flex-1 text-left text-sm font-semibold text-slate-100 hover:text-white"
          >
            {cat.name}
          </button>
        )}
        <button
          onClick={onExport}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1 rounded"
        >
          Export
        </button>
        <button
          onClick={onRemove}
          className="text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1 rounded"
        >
          Delete
        </button>
      </div>

      <div className="p-3 flex flex-col gap-3">
        <SearchStringCard
          title={cat.name}
          searchString={searchString}
          color="#e2e8f0"
          pokemonCount={cat.pokemon.length}
          idCount={idCount}
        />

        <PokemonInput
          pokemonData={pokemonData}
          existingIds={cat.pokemon}
          onAdd={onAddPokemon}
          color="#e2e8f0"
        />

        {cat.pokemon.length > 0 && (
          <div className="flex flex-col gap-1">
            {cat.pokemon.map(id => {
              const species = pokemonData.find(p => p.id === id);
              if (!species) return null;
              return (
                <div key={id} className="flex items-center justify-between bg-slate-700/50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-slate-400 font-mono text-xs shrink-0">#{id}</span>
                    <span className="text-sm truncate">{species.nameEn}</span>
                    {species.nameDe !== species.nameEn && (
                      <span className="text-xs text-slate-400 truncate">{species.nameDe}</span>
                    )}
                  </div>
                  <button
                    onClick={() => onRemovePokemon(id)}
                    className="text-red-400 active:text-red-300 transition-colors text-xl leading-none p-2 -mr-1 ml-1 shrink-0"
                    aria-label={`Remove ${species.nameEn}`}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function CustomSection({
  categories, pokemonData, onAdd, onRemove, onRename,
  onAddPokemon, onRemovePokemon, onExport, onExportCategory, onImport,
}: Props) {
  const [newName, setNewName] = useState('');
  const [showNew, setShowNew] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const submitNew = () => {
    if (newName.trim()) {
      onAdd(newName);
      setNewName('');
      setShowNew(false);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowNew(true)}
          className="flex-1 py-2.5 text-sm font-medium bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors border border-slate-600"
        >
          + New Category
        </button>
        <button
          onClick={onExport}
          className="px-4 py-2.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors border border-slate-600"
        >
          Export
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="px-4 py-2.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors border border-slate-600"
          title="Import adds lists without removing existing ones"
        >
          Import
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          onChange={e => { const f = e.target.files?.[0]; if (f) onImport(f); e.target.value = ''; }}
          className="hidden"
        />
      </div>
      <p className="text-xs text-slate-500 -mt-2">
        Import adds to your existing lists — nothing is removed.
      </p>

      {/* New category input */}
      {showNew && (
        <div className="flex gap-2">
          <input
            autoFocus
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submitNew(); if (e.key === 'Escape') { setShowNew(false); setNewName(''); } }}
            placeholder="Category name…"
            className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400"
          />
          <button
            onClick={submitNew}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors font-medium"
          >
            Create
          </button>
          <button
            onClick={() => { setShowNew(false); setNewName(''); }}
            className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {categories.length === 0 && !showNew && (
        <div className="text-center py-8 text-slate-500 text-sm">
          No custom categories yet.<br />Create one to start adding Pokémon.
        </div>
      )}

      {categories.map(cat => (
        <CategoryCard
          key={cat.id}
          cat={cat}
          pokemonData={pokemonData}
          onRemove={() => onRemove(cat.id)}
          onRename={name => onRename(cat.id, name)}
          onAddPokemon={id => onAddPokemon(cat.id, id)}
          onRemovePokemon={id => onRemovePokemon(cat.id, id)}
          onExport={() => onExportCategory(cat.id)}
        />
      ))}
    </div>
  );
}
