import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { WikiLink } from "@/components/wiki-link";
import { ModelsTable, type ModelRow } from "@/features/models/models-table";
import { loadAll } from "@/lib/data/load";

export const metadata: Metadata = {
  title: "Models",
  description: "Language models side by side: weights, size, context and price, each with its source.",
};

export default async function ModelsPage() {
  const { models, labs } = await loadAll();
  const labNames = new Map(labs.map((lab) => [lab.id, lab.name]));
  const rows: ModelRow[] = models.map((model) => ({ ...model, labName: labNames.get(model.lab_id) ?? model.lab_id }));

  return (
    <div className="space-y-10">
      <PageIntro eyebrow="Models" title="Language models, side by side" actions={<WikiLink page="languageModels" />}>
        Sort by any column, filter by how the weights are shared, search a model or a lab. A dash means the value is
        not public or not filled in yet; every row links to its source.
      </PageIntro>
      <ModelsTable models={rows} />
    </div>
  );
}
