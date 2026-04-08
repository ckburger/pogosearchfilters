#!/usr/bin/env node
/**
 * Fetches all Pokemon species from PokeAPI (REST) and generates src/data/pokemon.json
 * Run once: npm run generate-data
 * Takes ~1-3 minutes depending on connection speed.
 */
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const POKEAPI = 'https://pokeapi.co/api/v2';
const CONCURRENT = 40;

async function fetchJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function concurrentMap(items, fn, limit = CONCURRENT) {
  const results = new Array(items.length);
  let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await fn(items[i], i);
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
  await Promise.all(workers);
  return results;
}

function getIdFromUrl(url) {
  return parseInt(url.split('/').filter(Boolean).pop());
}

function flattenChain(node) {
  const ids = new Set();
  function traverse(n) {
    ids.add(getIdFromUrl(n.species.url));
    for (const evo of n.evolves_to) traverse(evo);
  }
  traverse(node);
  return Array.from(ids).sort((a, b) => a - b);
}

async function main() {
  const outDir = join(__dirname, '../src/data');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  console.log('Fetching species list...');
  const { results: speciesList } = await fetchJson(`${POKEAPI}/pokemon-species?limit=2000`);
  console.log(`Found ${speciesList.length} species`);

  console.log(`Fetching species details (${CONCURRENT} concurrent)...`);
  let done = 0;
  const speciesDetails = await concurrentMap(
    speciesList.map(s => s.url),
    async (url) => {
      const data = await fetchJson(url);
      process.stdout.write(`\r  ${++done}/${speciesList.length}  `);
      return data;
    }
  );
  console.log('');

  // Collect unique evolution chain URLs
  const chainUrlSet = new Set(speciesDetails.map(s => s.evolution_chain.url));
  const chainUrls = Array.from(chainUrlSet);
  console.log(`Fetching ${chainUrls.length} evolution chains (${CONCURRENT} concurrent)...`);

  let chainDone = 0;
  const chainResults = await concurrentMap(
    chainUrls,
    async (url) => {
      const data = await fetchJson(url);
      process.stdout.write(`\r  ${++chainDone}/${chainUrls.length}  `);
      return data;
    }
  );
  console.log('');

  // Build evolution map: species ID → all IDs in chain
  const evolutionMap = new Map();
  for (const chain of chainResults) {
    const ids = flattenChain(chain.chain);
    for (const id of ids) evolutionMap.set(id, ids);
  }

  // Build final data
  const pokemon = speciesDetails
    .map(species => {
      const nameEn = species.names.find(n => n.language.name === 'en')?.name ?? species.name;
      const nameDe = species.names.find(n => n.language.name === 'de')?.name ?? nameEn;
      const evolutionIds = evolutionMap.get(species.id) ?? [species.id];
      return { id: species.id, nameEn, nameDe, evolutionIds };
    })
    .sort((a, b) => a.id - b.id);

  const outPath = join(outDir, 'pokemon.json');
  writeFileSync(outPath, JSON.stringify(pokemon));
  console.log(`\nWritten ${pokemon.length} Pokémon to src/data/pokemon.json`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
