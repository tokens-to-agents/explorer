import type { Metadata } from "next";
import { buildMapData } from "@/features/map/build-map-data";
import { MapExplorer } from "@/features/map/map-explorer";
import { loadAll } from "@/lib/data/load";

export const metadata: Metadata = {
  title: "Map",
  description: "Where AI is built: labs, data centers, the chip supply chain and its flows, and AI rules, on a globe.",
};

export default async function MapPage() {
  const { points, countries, flows, layers } = buildMapData(await loadAll());
  return (
    <main>
      <MapExplorer points={points} countries={countries} flows={flows} layers={layers} />
    </main>
  );
}
