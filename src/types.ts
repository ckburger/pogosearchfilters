export type PvpLeague = 'gl' | 'ul' | 'ml';

export const POGO_TYPES = [
  'bug', 'dark', 'dragon', 'electric', 'fairy',
  'fighting', 'fire', 'flying', 'ghost', 'grass',
  'ground', 'ice', 'normal', 'poison', 'psychic',
  'rock', 'steel', 'water',
] as const;
export type PogoType = typeof POGO_TYPES[number];

export const TYPE_COLORS: Record<PogoType, string> = {
  bug: '#92A212', dark: '#4F3A27', dragon: '#0F6AC0', electric: '#FAC000',
  fairy: '#EF70EF', fighting: '#D56723', fire: '#FA7824', flying: '#3DC7EF',
  ghost: '#70559B', grass: '#78C850', ground: '#E0C068', ice: '#98D8D8',
  normal: '#A8A878', poison: '#A040A0', psychic: '#F85888', rock: '#B8A038',
  steel: '#B8B8D0', water: '#6890F0',
};

export interface PokemonSpecies {
  id: number;
  nameEn: string;
  nameDe: string;
  evolutionIds: number[];
}

export interface CustomCategory {
  id: string;
  name: string;
  pokemon: number[];
}

export interface PvpEntry {
  dex: number;
  shadow: boolean;
}

export interface FetchedData {
  gl: PvpEntry[];
  ul: PvpEntry[];
  ml: PvpEntry[];
  pve: Record<string, number[]>;
  lastUpdated: string;
}

export const LEAGUE_LABELS: Record<PvpLeague, string> = {
  gl: 'Great League',
  ul: 'Ultra League',
  ml: 'Master League',
};

export const LEAGUE_COLORS: Record<PvpLeague, string> = {
  gl: '#3b82f6',
  ul: '#8b5cf6',
  ml: '#eab308',
};
