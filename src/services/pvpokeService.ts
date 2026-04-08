import type { FetchedData, PvpEntry } from '../types';

const PVPOKE = 'https://raw.githubusercontent.com/pvpoke/pvpoke/master/src/data';

interface RankingEntry {
  speciesId: string;
  score: number;
}

interface GMPokemon {
  dex: number;
  speciesId: string;
  released?: boolean;
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


export async function fetchAllData(): Promise<FetchedData> {
  const [glRankings, ulRankings, mlRankings, gmPokemon] = await Promise.all([
    fetchJson<RankingEntry[]>(`${PVPOKE}/rankings/all/overall/rankings-1500.json`),
    fetchJson<RankingEntry[]>(`${PVPOKE}/rankings/all/overall/rankings-2500.json`),
    fetchJson<RankingEntry[]>(`${PVPOKE}/rankings/all/overall/rankings-10000.json`),
    fetchJson<GMPokemon[]>(`${PVPOKE}/gamemaster/pokemon.json`),
  ]);

  const speciesMap = new Map<string, number>();
  for (const p of gmPokemon) {
    if (p.dex && p.released !== false) speciesMap.set(p.speciesId, p.dex);
  }

  return {
    gl: rankingsToDexIds(glRankings, speciesMap, 100),
    ul: rankingsToDexIds(ulRankings, speciesMap, 100),
    ml: rankingsToDexIds(mlRankings, speciesMap, 100),
    lastUpdated: new Date().toISOString(),
  };
}
