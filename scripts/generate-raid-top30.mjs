#!/usr/bin/env node
/**
 * generate-raid-top30.mjs
 *
 * Scrapes the Top 30 Raid Attackers per type from db.pokemongohub.net
 * and writes them to scripts/pogo-raid-top30.json
 *
 * Usage:
 *   node scripts/generate-raid-top30.mjs
 *
 * Requirements:
 *   npm install playwright
 *   npx playwright install chromium
 */

import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const BASE_URL = 'https://db.pokemongohub.net/de/pokemon-list/best-per-type';

const TYPES = [
  'normal', 'fighting', 'flying', 'poison', 'ground', 'rock',
  'bug', 'ghost', 'steel', 'fire', 'water', 'grass',
  'electric', 'psychic', 'ice', 'dragon', 'dark', 'fairy'
];

/**
 * Extracts top 30 attackers from the currently loaded page.
 * Marks legacy moves with ★ (the site uses * suffix).
 */
async function extractPageData(page) {
  return page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('table tbody tr'));
    return rows.slice(0, 30).map(row => {
      const cells = Array.from(row.querySelectorAll('td'));
      const links = Array.from(row.querySelectorAll('a'));
      const nameLink = links[0];
      const fastLink  = links[1];
      const chargedLink = links[2];

      const hrefMatch = nameLink?.href?.match(/\/pokemon\/(\d+)/);
      const dex = hrefMatch ? parseInt(hrefMatch[1]) : null;

      const fa = (fastLink?.textContent?.trim() || cells[2]?.textContent?.trim() || '')
        .replace(/ \*$/, ' ★').replace(/\*$/, '★');
      const ca = (chargedLink?.textContent?.trim() || cells[3]?.textContent?.trim() || '')
        .replace(/ \*$/, ' ★').replace(/\*$/, '★');

      return {
        rank: parseInt(cells[0]?.textContent?.trim()) || 0,
        name: nameLink?.textContent?.trim() || '',
        dex,
        fastAttack: fa,
        chargedAttack: ca,
      };
    });
  });
}

async function main() {
  console.log('🚀 Starting Pokémon GO Raid Top-30 scraper...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Block images and fonts to speed up loading
  await page.route('**/*.{png,jpg,jpeg,gif,webp,svg,woff,woff2,ttf}', route => route.abort());

  const result = {
    generated: new Date().toISOString().slice(0, 10),
    source: BASE_URL,
    note: '★ markiert Legacy-Attacken',
    types: {}
  };

  for (const type of TYPES) {
    const url = `${BASE_URL}/${type}`;
    process.stdout.write(`  Scraping ${type.padEnd(10)} ... `);

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });

      // Wait for the table to have at least 5 rows
      await page.waitForFunction(
        () => document.querySelectorAll('table tbody tr').length >= 5,
        { timeout: 15_000 }
      );

      const data = await extractPageData(page);
      result.types[type] = data;
      console.log(`✓  ${data.length} Pokémon`);
    } catch (err) {
      console.log(`✗  ERROR: ${err.message}`);
      result.types[type] = [];
    }
  }

  await browser.close();

  const outPath = join(__dirname, 'pogo-raid-top30.json');
  writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8');

  const totalTypes = Object.keys(result.types).length;
  const totalPokemon = Object.values(result.types).reduce((s, arr) => s + arr.length, 0);

  console.log(`\n✅ Done! Wrote ${totalTypes} types / ${totalPokemon} entries to:`);
  console.log(`   ${outPath}\n`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
