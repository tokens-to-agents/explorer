import type { RegulationLevel } from "@/config/taxonomy";
import type { WikiPageKey } from "@/config/wiki";

/** Everything the client needs to draw and describe one point. Built on the server, serializable. */
export type MapPoint = {
  id: string;
  layerId: string;
  name: string;
  kind: string;
  location: string;
  lat: number;
  lon: number;
  color: string;
  facts: { label: string; value: string }[];
  note?: string;
  source: string;
  checked?: string;
  wiki: WikiPageKey;
};

export type MapCountry = {
  iso: string;
  layerId: string;
  name: string;
  level: RegulationLevel;
  label: string;
  color: string;
  note: string;
  source: string;
  checked?: string;
  wiki: WikiPageKey;
};

export type MapLayerState = {
  id: string;
  label: string;
  description: string;
  status: "live" | "planned";
  kind?: "points" | "countries";
  color?: string;
  count: number;
  defaultOn: boolean;
  wiki: WikiPageKey;
};

export type MapSelection = { type: "point"; item: MapPoint } | { type: "country"; item: MapCountry };
