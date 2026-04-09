import type { PveEntry, PogoType } from '../types';
import rawData from '../data/pve-rankings.json';

function parseName(raw: string): { name: string; legacy: boolean } {
  if (raw.endsWith(' ★')) return { name: raw.slice(0, -2), legacy: true };
  return { name: raw, legacy: false };
}

type RawEntry = { dex: number; name: string; fastAttack: string; chargedAttack: string };
const raw = rawData as { types: Record<string, RawEntry[]> };

export const pveRankings: Record<PogoType, PveEntry[]> = Object.fromEntries(
  Object.entries(raw.types).map(([type, entries]) => [
    type,
    entries.map(e => {
      const fast = parseName(e.fastAttack);
      const charged = parseName(e.chargedAttack);
      const shadow = e.name.includes('Crypto-');
      return {
        dex: e.dex,
        shadow,
        name: shadow ? e.name.replace('Crypto-', '') : e.name,
        fastMove: fast.name,
        chargedMove: charged.name,
        fastLegacy: fast.legacy,
        chargedLegacy: charged.legacy,
      };
    }),
  ]),
) as Record<PogoType, PveEntry[]>;
