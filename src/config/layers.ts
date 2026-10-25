import { palette } from "./taxonomy";
import type { WikiPageKey } from "./wiki";

/**
 * Map layers. Adding a layer = one entry here (+ its rows in data/).
 * `points` layers read labs.csv or places.csv; `countries` layers read countries.csv;
 * `flows` layers read flows.csv (animated arcs between two places).
 */
export type LayerConfig =
  | {
      id: string;
      label: string;
      description: string;
      kind: "points";
      color: string;
      source: { file: "labs" } | { file: "places"; types: string[] };
      wiki: WikiPageKey;
      status: "live";
      defaultOn: boolean;
    }
  | {
      id: string;
      label: string;
      description: string;
      kind: "countries";
      wiki: WikiPageKey;
      status: "live";
      defaultOn: boolean;
    }
  | {
      id: string;
      label: string;
      description: string;
      kind: "flows";
      wiki: WikiPageKey;
      status: "live";
      defaultOn: boolean;
    }
  | { id: string; label: string; description: string; wiki: WikiPageKey; status: "planned" };

export const layers: LayerConfig[] = [
  {
    id: "labs",
    label: "Labs",
    description: "Headquarters of the labs that train models.",
    kind: "points",
    color: palette.magenta,
    source: { file: "labs" },
    wiki: "labs",
    status: "live",
    defaultOn: true,
  },
  {
    id: "datacenters",
    label: "Data centers",
    description: "The largest AI data centers, built or announced.",
    kind: "points",
    color: palette.peach,
    source: { file: "places", types: ["datacenter"] },
    wiki: "dataCenters",
    status: "live",
    defaultOn: true,
  },
  {
    id: "supply-chain",
    label: "Chip supply chain",
    description: "Who designs AI chips, makes them, and supplies their memory and machines.",
    kind: "points",
    color: palette.cyan,
    source: { file: "places", types: ["chip-design", "fab", "equipment", "memory"] },
    wiki: "chipSupplyChain",
    status: "live",
    defaultOn: true,
  },
  {
    id: "chip-flows",
    label: "Chip flows",
    description: "What travels between the sites of the supply chain: machines, designs, memory, finished chips.",
    kind: "flows",
    wiki: "chipSupplyChain",
    status: "live",
    defaultOn: true,
  },
  {
    id: "regulation",
    label: "Regulation",
    description: "How each country regulates AI.",
    kind: "countries",
    wiki: "regulation",
    status: "live",
    defaultOn: false,
  },
  { id: "energy", label: "Energy", description: "Power plants and deals that feed data centers.", wiki: "energy", status: "planned" },
  { id: "export-controls", label: "Export controls", description: "Who may buy advanced AI chips.", wiki: "geopolitics", status: "planned" },
  { id: "investment", label: "Investment", description: "Where the money goes, country by country.", wiki: "investment", status: "planned" },
];
