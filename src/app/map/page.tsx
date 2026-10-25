import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { buildMapData } from "@/features/map/build-map-data";
import { MapExplorer } from "@/features/map/map-explorer";
import { loadAll } from "@/lib/data/load";

export const metadata: Metadata = {
  title: "Map",
  description: "Where AI is built: labs, data centers, the chip supply chain and AI rules, on a globe.",
};

export default async function MapPage() {
  const { points, countries, layers } = buildMapData(await loadAll());

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Map" title="Where AI is built, powered and regulated">
        Turn on a layer, point at a dot or a country, and follow the link to the wiki page that explains it. Each
        layer is a list of sourced rows; planned layers appear as they are filled.
      </PageIntro>
      <MapExplorer points={points} countries={countries} layers={layers} />
    </div>
  );
}
