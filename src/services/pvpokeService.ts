import { POGO_TYPES } from '../types';
import type { FetchedData, PvpEntry } from '../types';

const PVPOKE = 'https://raw.githubusercontent.com/pvpoke/pvpoke/master/src/data';

interface RankingEntry {
  speciesId: string;
  score: number;
}

interface GMPokemon {
  dex: number;
  speciesId: string;
  types: string[];
  baseStats: { atk: number; def: number; hp: number };
  fastMoves: string[];
  chargedMoves: string[];
  tags?: string[];
  released?: boolean;
}

interface GMMove {
  moveId: string;
  type: string;
  power: number;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.json() as Promise<T>;
}

function rankingsToDexIds(
  rankings: RankingEntry[],
  speciesMap: Map<string, number>,
  limit: number,
): PvpEntry[] {
  const seen = new Set<string>();
  const result: PvpEntry[] = [];
  for (const entry of rankings) {
    if (result.length >= limit) break;
    const shadow = entry.speciesId.endsWith('_shadow');
    const dex =
      speciesMap.get(entry.speciesId) ??
      speciesMap.get(entry.speciesId.replace(/_shadow$/, ''));
    const key = `${dex}-${shadow}`;
    if (dex && !seen.has(key)) {
      seen.add(key);
      result.push({ dex, shadow });
    }
  }
  return result;
}

function computePveRankings(
  gmPokemon: GMPokemon[],
  gmMoves: GMMove[],
): Record<string, number[]> {
  const moveTypeMap = new Map<string, string>();
  for (const m of gmMoves) moveTypeMap.set(m.moveId, m.type);

  const pve: Record<string, number[]> = {};

  for (const type of POGO_TYPES) {
    const scores = new Map<number, number>();

    for (const p of gmPokemon) {
      if (!p.dex || p.released === false) continue;
      const allMoves = [...p.fastMoves, ...p.chargedMoves];
      const hasTypeMove = allMoves.some(m => moveTypeMap.get(m) === type);
      if (!hasTypeMove) continue;

      const shadow = p.tags?.includes('shadow') ? 1.2 : 1.0;
      const stab = p.types.includes(type) ? 1.2 : 1.0;
      const score = p.baseStats.atk * shadow * stab;

      const current = scores.get(p.dex) ?? 0;
      if (score > current) scores.set(p.dex, score);
    }

    pve[type] = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([dex]) => dex);
  }

  return pve;
}

export async function fetchAllData(): Promise<FetchedData> {
  const [glRankings, ulRankings, mlRankings, gmPokemon, gmMoves] = await Promise.all([
    fetchJson<RankingEntry[]>(`${PVPOKE}/rankings/all/overall/rankings-1500.json`),
    fetchJson<RankingEntry[]>(`${PVPOKE}/rankings/all/overall/rankings-2500.json`),
    fetchJson<RankingEntry[]>(`${PVPOKE}/rankings/all/overall/rankings-10000.json`),
    fetchJson<GMPokemon[]>(`${PVPOKE}/gamemaster/pokemon.json`),
    fetchJson<GMMove[]>(`${PVPOKE}/gamemaster/moves.json`),
  ]);

  const speciesMap = new Map<string, number>();
  for (const p of gmPokemon) {
    if (p.dex && p.released !== false) speciesMap.set(p.speciesId, p.dex);
  }

  return {
    gl: rankingsToDexIds(glRankings, speciesMap, 100),
    ul: rankingsToDexIds(ulRankings, speciesMap, 100),
    ml: rankingsToDexIds(mlRankings, speciesMap, 100),
    pve: computePveRankings(gmPokemon, gmMoves),
    lastUpdated: new Date().toISOString(),
  };
}
