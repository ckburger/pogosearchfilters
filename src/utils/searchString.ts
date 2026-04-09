import type { PokemonSpecies } from '../types';

function expandEvolutions(ids: Iterable<number>, pokemonData: PokemonSpecies[]): Set<number> {
  const result = new Set<number>();
  for (const id of ids) {
    const species = pokemonData.find(p => p.id === id);
    if (species) {
      for (const eid of species.evolutionIds) result.add(eid);
    }
  }
  return result;
}

function toRangeString(ids: Set<number>): string {
  if (ids.size === 0) return '';
  const sorted = Array.from(ids).sort((a, b) => a - b);
  const groups: [number, number][] = [];
  let start = sorted[0];
  let end = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      groups.push([start, end]);
      start = sorted[i];
      end = sorted[i];
    }
  }
  groups.push([start, end]);
  return groups.map(([s, e]) => (s === e ? `${s}` : `${s}-${e}`)).join(',');
}

export function generateSearchString(
  ids: number[],
  pokemonData: PokemonSpecies[],
): string {
  return toRangeString(expandEvolutions(ids, pokemonData));
}

export function generateCryptoString(
  shadowIds: ReadonlySet<number>,
  pokemonData: PokemonSpecies[],
): string {
  if (shadowIds.size === 0) return '';
  const expanded = expandEvolutions(shadowIds, pokemonData);
  return Array.from(expanded).sort((a, b) => a - b).map(id => `crypto&${id}`).join(',');
}

export function negateSearchString(s: string): string {
  if (!s) return '';
  return s.split(',').map(seg => `!${seg}`).join('&');
}

export function countUniqueIds(ids: number[], pokemonData: PokemonSpecies[]): number {
  const all = new Set<number>();
  for (const id of ids) {
    const s = pokemonData.find(p => p.id === id);
    if (s) s.evolutionIds.forEach(e => all.add(e));
  }
  return all.size;
}
