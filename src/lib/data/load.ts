import Papa from "papaparse";
import type { z } from "zod";
import { countrySchema, eventSchema, labSchema, modelSchema, placeSchema } from "./schema";
import type { Country, Lab, Model, Place, TimelineEvent } from "./schema";
import { readDataFile } from "./source";

export class DataError extends Error {
  constructor(file: string, problems: string[]) {
    super(`Invalid data in data/${file}:\n${problems.map((p) => `  - ${p}`).join("\n")}`);
    this.name = "DataError";
  }
}

async function loadCsv<S extends z.ZodType>(file: string, schema: S): Promise<z.output<S>[]> {
  const text = await readDataFile(file);
  const parsed = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true });
  const problems = parsed.errors.map((e) => `row ${(e.row ?? 0) + 2}: ${e.message}`);
  const rows: z.output<S>[] = [];

  parsed.data.forEach((raw, index) => {
    const result = schema.safeParse(raw);
    if (result.success) rows.push(result.data);
    else
      for (const issue of result.error.issues)
        problems.push(`row ${index + 2}, ${issue.path.join(".") || "row"}: ${issue.message}`);
  });

  const ids = rows.map((row) => (row as { id?: string; iso_numeric?: string }).id ?? (row as { iso_numeric?: string }).iso_numeric);
  const duplicates = ids.filter((id, i) => id !== undefined && ids.indexOf(id) !== i);
  if (duplicates.length) problems.push(`duplicate ids: ${[...new Set(duplicates)].join(", ")}`);

  if (problems.length) throw new DataError(file, problems);
  return rows;
}

export type ExplorerData = {
  labs: Lab[];
  places: Place[];
  events: TimelineEvent[];
  models: Model[];
  countries: Country[];
};

let cache: Promise<ExplorerData> | undefined;

/** Loads and validates every data file once per build, including links between files. */
export function loadAll(): Promise<ExplorerData> {
  cache ??= (async () => {
    const [labs, places, events, models, countries] = await Promise.all([
      loadCsv("labs.csv", labSchema),
      loadCsv("places.csv", placeSchema),
      loadCsv("events.csv", eventSchema),
      loadCsv("models.csv", modelSchema),
      loadCsv("countries.csv", countrySchema),
    ]);

    const labIds = new Set(labs.map((lab) => lab.id));
    const unknownLabs = models.filter((model) => !labIds.has(model.lab_id));
    if (unknownLabs.length)
      throw new DataError(
        "models.csv",
        unknownLabs.map((model) => `${model.id}: lab_id "${model.lab_id}" is not in labs.csv`),
      );

    return { labs, places, events, models, countries };
  })();
  return cache;
}
