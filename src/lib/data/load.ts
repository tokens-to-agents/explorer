import Papa from "papaparse";
import type { z } from "zod";
import { benchmarks as benchmarkConfig } from "@/config/benchmarks";
import { benchmarkScoreSchema, countrySchema, eventSchema, flowSchema, labSchema, modelSchema, placeSchema } from "./schema";
import type { BenchmarkScore, Country, Flow, Lab, Model, Place, TimelineEvent } from "./schema";
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

  const ids = rows.map((row) => {
    const r = row as { id?: string; iso_numeric?: string; model_id?: string; benchmark?: string };
    return r.id ?? r.iso_numeric ?? (r.model_id && r.benchmark ? `${r.model_id} × ${r.benchmark}` : undefined);
  });
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
  flows: Flow[];
  benchmarks: BenchmarkScore[];
};

/** Collects every reference that points to a missing row, file by file. */
function checkReferences(file: string, problems: string[]) {
  if (problems.length) throw new DataError(file, problems);
}

let cache: Promise<ExplorerData> | undefined;

/** Loads and validates every data file once per build, including links between files. */
export function loadAll(): Promise<ExplorerData> {
  cache ??= (async () => {
    const [labs, places, events, models, countries, flows, benchmarks] = await Promise.all([
      loadCsv("labs.csv", labSchema),
      loadCsv("places.csv", placeSchema),
      loadCsv("events.csv", eventSchema),
      loadCsv("models.csv", modelSchema),
      loadCsv("countries.csv", countrySchema),
      loadCsv("flows.csv", flowSchema),
      loadCsv("benchmarks.csv", benchmarkScoreSchema),
    ]);

    const labIds = new Set(labs.map((lab) => lab.id));
    const placeIds = new Set(places.map((place) => place.id));
    const modelIds = new Set(models.map((model) => model.id));
    const benchmarkIds = new Set(benchmarkConfig.map((benchmark) => benchmark.id));

    checkReferences(
      "models.csv",
      models.filter((model) => !labIds.has(model.lab_id)).map((model) => `${model.id}: lab_id "${model.lab_id}" is not in labs.csv`),
    );
    checkReferences(
      "flows.csv",
      flows.flatMap((flow) =>
        [flow.from_id, flow.to_id].filter((id) => !placeIds.has(id)).map((id) => `${flow.id}: "${id}" is not in places.csv`),
      ),
    );
    checkReferences("benchmarks.csv", [
      ...benchmarks.filter((row) => !modelIds.has(row.model_id)).map((row) => `"${row.model_id}" is not in models.csv`),
      ...benchmarks
        .filter((row) => !benchmarkIds.has(row.benchmark))
        .map((row) => `benchmark "${row.benchmark}" is not declared in src/config/benchmarks.ts`),
    ]);

    return { labs, places, events, models, countries, flows, benchmarks };
  })();
  return cache;
}
