import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Where the CSV files come from. Today: the local data/ folder, read at build time
 * (every page is prerendered, so nothing is read at request time).
 * When the data moves to the wiki repo, only this function changes
 * (point EXPLORER_DATA_DIR at a checked-out copy, or fetch the raw files here).
 */
const DATA_DIR = process.env.EXPLORER_DATA_DIR ?? path.join(/* turbopackIgnore: true */ process.cwd(), "data");

export async function readDataFile(name: string): Promise<string> {
  return readFile(path.join(/* turbopackIgnore: true */ DATA_DIR, name), "utf8");
}
