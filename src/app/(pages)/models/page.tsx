import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { WikiLink } from "@/components/wiki-link";
import { ModelsTable, type ModelRow, type ScoreCell } from "@/features/models/models-table";
import { loadAll } from "@/lib/data/load";

export const metadata: Metadata = {
  title: "Models",
  description: "Language models side by side: weights, size, context and price, each with its source.",
};

export default async function ModelsPage() {
  const { models, labs, benchmarks } = await loadAll();
  const labNames = new Map(labs.map((lab) => [lab.id, lab.name]));
  const scoresByModel = new Map<string, Record<string, ScoreCell>>();
  for (const { model_id, benchmark, ...cell } of benchmarks) {
    scoresByModel.set(model_id, { ...scoresByModel.get(model_id), [benchmark]: cell });
  }
  const rows: ModelRow[] = models.map((model) => ({
    ...model,
    labName: labNames.get(model.lab_id) ?? model.lab_id,
    scores: scoresByModel.get(model.id) ?? {},
  }));

  return (
    <div className="space-y-10">
      <PageIntro eyebrow="Models" title="Language models, side by side" actions={<WikiLink page="languageModels" />}>
        Sort by any column, filter by how the weights are shared, search a model or a lab. Point at a benchmark to
        see what it measures. A dash means the value is not public or not filled in yet.
      </PageIntro>
      <ModelsTable models={rows} />
    </div>
  );
}
