import { layers, type LayerConfig } from "@/config/layers";
import { placeTypeLabels, regulationLevels } from "@/config/taxonomy";
import type { ExplorerData } from "@/lib/data/load";
import type { MapCountry, MapLayerState, MapPoint } from "./types";

const labTypeLabels = { frontier: "Frontier lab", "open-weight": "Open-weight lab", research: "Research lab" } as const;
const statusLabels = { planned: "Planned", construction: "Under construction", operational: "Operational" } as const;

function pointsFor(layer: Extract<LayerConfig, { kind: "points" }>, data: ExplorerData): MapPoint[] {
  if (layer.source.file === "labs") {
    return data.labs.map((lab) => ({
      id: lab.id,
      layerId: layer.id,
      name: lab.name,
      kind: labTypeLabels[lab.type],
      location: `${lab.city}, ${lab.country}`,
      lat: lab.lat,
      lon: lab.lon,
      color: layer.color,
      facts: [
        ...(lab.founded ? [{ label: "Founded", value: String(lab.founded) }] : []),
        ...(lab.url ? [{ label: "Website", value: new URL(lab.url).hostname }] : []),
      ],
      source: lab.source,
      checked: lab.checked,
      wiki: layer.wiki,
    }));
  }
  const types = new Set(layer.source.types);
  return data.places
    .filter((place) => types.has(place.type))
    .map((place) => ({
      id: place.id,
      layerId: layer.id,
      name: place.name,
      kind: placeTypeLabels[place.type],
      location: `${place.city}, ${place.country}`,
      lat: place.lat,
      lon: place.lon,
      color: layer.color,
      facts: [
        { label: "Owner", value: place.owner },
        { label: "Status", value: statusLabels[place.status] },
        ...(place.capacity_mw ? [{ label: "Power", value: `${place.capacity_mw.toLocaleString("en")} MW` }] : []),
      ],
      note: place.note,
      source: place.source,
      checked: place.checked,
      wiki: layer.wiki,
    }));
}

/** Turns the validated data + the layer config into what the globe draws. */
export function buildMapData(data: ExplorerData) {
  const points: MapPoint[] = [];
  const countries: MapCountry[] = [];
  const states: MapLayerState[] = [];

  for (const layer of layers) {
    if (layer.status === "planned") {
      states.push({ ...layer, count: 0, defaultOn: false });
      continue;
    }
    if (layer.kind === "points") {
      const layerPoints = pointsFor(layer, data);
      points.push(...layerPoints);
      states.push({ ...layer, count: layerPoints.length });
      continue;
    }
    const layerCountries: MapCountry[] = data.countries.map((country) => ({
      iso: country.iso_numeric,
      layerId: layer.id,
      name: country.name,
      level: country.regulation,
      label: regulationLevels[country.regulation].label,
      color: regulationLevels[country.regulation].color,
      note: country.note,
      source: country.source,
      checked: country.checked,
      wiki: layer.wiki,
    }));
    countries.push(...layerCountries);
    states.push({ ...layer, count: layerCountries.length });
  }

  return { points, countries, layers: states };
}
