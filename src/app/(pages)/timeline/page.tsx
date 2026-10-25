import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { WikiLink } from "@/components/wiki-link";
import { TimelineExplorer } from "@/features/timeline/timeline-explorer";
import { loadAll } from "@/lib/data/load";

export const metadata: Metadata = {
  title: "Timeline",
  description: "The history of AI from 1943 to today, filtered by topic.",
};

export default async function TimelinePage() {
  const { events } = await loadAll();

  return (
    <div className="space-y-10">
      <PageIntro eyebrow="Timeline" title="From the first artificial neuron to agents" actions={<WikiLink page="historyOverview" />}>
        Every event has a date, a topic and a source. The six eras match the History section of the wiki, which
        explains why each turn happened.
      </PageIntro>
      <TimelineExplorer events={events} />
    </div>
  );
}
