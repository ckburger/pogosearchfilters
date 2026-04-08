import { useState, useCallback } from 'react';
import type { CustomCategory, FetchedData } from '../types';
import { fetchAllData } from '../services/pvpokeService';

const KEY_FETCHED = 'pogo-fetched-v4';
const KEY_CUSTOM = 'pogo-custom-v1';

function loadFetched(): FetchedData | null {
  try {
    const raw = localStorage.getItem(KEY_FETCHED);
    return raw ? (JSON.parse(raw) as FetchedData) : null;
  } catch { return null; }
}

function loadCustom(): CustomCategory[] {
  try {
    const raw = localStorage.getItem(KEY_CUSTOM);
    return raw ? (JSON.parse(raw) as CustomCategory[]) : [];
  } catch { return []; }
}

function saveCustom(cats: CustomCategory[]) {
  localStorage.setItem(KEY_CUSTOM, JSON.stringify(cats));
}

export function useAppStore() {
  const [fetched, setFetched] = useState<FetchedData | null>(loadFetched);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [custom, setCustom] = useState<CustomCategory[]>(loadCustom);

  const refresh = useCallback(async () => {
    setIsFetching(true);
    setFetchError(null);
    try {
      const data = await fetchAllData();
      localStorage.setItem(KEY_FETCHED, JSON.stringify(data));
      setFetched(data);
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIsFetching(false);
    }
  }, []);

  const addCategory = useCallback((name: string) => {
    const cat: CustomCategory = {
      id: Date.now().toString(36),
      name: name.trim(),
      pokemon: [],
    };
    setCustom(prev => {
      const next = [...prev, cat];
      saveCustom(next);
      return next;
    });
  }, []);

  const removeCategory = useCallback((id: string) => {
    setCustom(prev => {
      const next = prev.filter(c => c.id !== id);
      saveCustom(next);
      return next;
    });
  }, []);

  const renameCategory = useCallback((id: string, name: string) => {
    setCustom(prev => {
      const next = prev.map(c => c.id === id ? { ...c, name: name.trim() } : c);
      saveCustom(next);
      return next;
    });
  }, []);

  const addPokemonToCategory = useCallback((catId: string, speciesId: number) => {
    setCustom(prev => {
      const next = prev.map(c =>
        c.id === catId && !c.pokemon.includes(speciesId)
          ? { ...c, pokemon: [...c.pokemon, speciesId] }
          : c,
      );
      saveCustom(next);
      return next;
    });
  }, []);

  const removePokemonFromCategory = useCallback((catId: string, speciesId: number) => {
    setCustom(prev => {
      const next = prev.map(c =>
        c.id === catId
          ? { ...c, pokemon: c.pokemon.filter(id => id !== speciesId) }
          : c,
      );
      saveCustom(next);
      return next;
    });
  }, []);

  function download(filename: string, data: unknown) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  const exportCustom = useCallback(() => {
    download('pogo-custom-filters.json', { version: 1, custom });
  }, [custom]);

  const exportCategory = useCallback((catId: string) => {
    const cat = custom.find(c => c.id === catId);
    if (!cat) return;
    const slug = cat.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    download(`pogo-filter-${slug}.json`, { version: 1, category: cat });
  }, [custom]);

  const importCustom = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target?.result as string);

        function isValidCat(c: unknown): c is CustomCategory {
          return (
            typeof (c as CustomCategory).name === 'string' &&
            Array.isArray((c as CustomCategory).pokemon)
          );
        }

        function freshId(i = 0) {
          return `${Date.now().toString(36)}_${i}`;
        }

        let toImport: CustomCategory[] = [];

        if (isValidCat(data.category)) {
          // Single-category file
          toImport = [{ ...data.category as CustomCategory, id: freshId() }];
        } else if (Array.isArray(data.custom)) {
          // All-categories file
          toImport = (data.custom as unknown[])
            .filter(isValidCat)
            .map((c, i) => ({ ...c, id: freshId(i) }));
        }

        if (toImport.length === 0) {
          alert('No valid categories found in this file.');
          return;
        }

        // Merge: append to existing lists, never delete
        setCustom(prev => {
          const next = [...prev, ...toImport];
          saveCustom(next);
          return next;
        });
      } catch {
        alert('Invalid file format.');
      }
    };
    reader.readAsText(file);
  }, []);

  return {
    fetched,
    isFetching,
    fetchError,
    custom,
    refresh,
    addCategory,
    removeCategory,
    renameCategory,
    addPokemonToCategory,
    removePokemonFromCategory,
    exportCustom,
    exportCategory,
    importCustom,
  };
}
