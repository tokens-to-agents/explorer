import { loadAll } from "../src/lib/data/load";

/** `npm run validate-data`: checks every CSV in data/ without building the site. */
try {
  const data = await loadAll();
  const unverified = [...data.labs, ...data.places, ...data.models, ...data.countries].filter((row) => !row.checked).length;
  for (const [name, rows] of Object.entries(data)) console.log(`✓ ${name.padEnd(10)} ${rows.length} rows`);
  console.log(`  ${unverified} rows not verified yet (empty "checked" column)`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
