import type { WikiPageKey } from "./wiki";

/**
 * Shared vocabulary: timeline tags, eras, lab types, place types, regulation levels.
 * Colors come from the palette in globals.css; a color is never the only cue (labels are always shown).
 */

export const palette = {
  peach: "#F5AF94",
  salmon: "#F5949D",
  pink: "#FF8AA8",
  magenta: "#F786C6",
  green: "#90D79F",
  mint: "#6DD0A9",
  blue: "#7EAAD4",
  cyan: "#70BAD2",
  moon: "#ECE8E8",
} as const;

export const TAG_IDS = ["research", "models", "products", "companies", "compute", "policy"] as const;
export type TagId = (typeof TAG_IDS)[number];

export const tags: Record<TagId, { label: string; color: string; section: string }> = {
  research: { label: "Research", color: palette.blue, section: "Foundations" },
  models: { label: "Models", color: palette.mint, section: "Models" },
  products: { label: "Products", color: palette.magenta, section: "Ecosystem" },
  companies: { label: "Companies", color: palette.cyan, section: "Ecosystem" },
  compute: { label: "Compute", color: palette.peach, section: "Infrastructure" },
  policy: { label: "Policy", color: palette.salmon, section: "Society" },
};

export type Era = { id: string; label: string; from: number; to: number | null; wiki: WikiPageKey };

/** The six eras of History › Overview, in order. `to: null` = ongoing. */
export const eras: Era[] = [
  { id: "early-ai", label: "Early AI", from: 1943, to: 1993, wiki: "earlyAi" },
  { id: "machine-learning", label: "Machine learning", from: 1993, to: 2011, wiki: "machineLearning" },
  { id: "deep-learning", label: "Deep learning", from: 2012, to: 2016, wiki: "deepLearning" },
  { id: "transformers", label: "Transformers", from: 2017, to: 2021, wiki: "transformers" },
  { id: "generative-ai", label: "Generative AI", from: 2022, to: 2023, wiki: "generativeAi" },
  { id: "reasoning-agents", label: "Reasoning & agents", from: 2024, to: null, wiki: "reasoningAgents" },
];

export function eraOfYear(year: number): Era {
  // Boundary years (1993) belong to the later era.
  const found = [...eras].reverse().find((era) => year >= era.from);
  return found ?? eras[0]!;
}

export const LAB_TYPES = ["frontier", "open-weight", "research"] as const;
export const PLACE_TYPES = ["datacenter", "chip-design", "fab", "equipment", "memory"] as const;
export const PLACE_STATUSES = ["planned", "construction", "operational"] as const;
export const OPENNESS = ["closed", "open-weights", "open-source"] as const;
export const MODALITIES = ["language", "image", "video", "audio", "world", "science", "task"] as const;

export const REGULATION_LEVELS = ["comprehensive", "targeted", "principles", "none-federal"] as const;
export type RegulationLevel = (typeof REGULATION_LEVELS)[number];

export const regulationLevels: Record<RegulationLevel, { label: string; color: string }> = {
  comprehensive: { label: "Comprehensive AI law", color: palette.mint },
  targeted: { label: "Targeted binding rules", color: palette.blue },
  principles: { label: "Principles, no AI-specific law", color: palette.peach },
  "none-federal": { label: "No federal AI law, state laws", color: palette.salmon },
};

export const placeTypeLabels: Record<(typeof PLACE_TYPES)[number], string> = {
  datacenter: "Data center",
  "chip-design": "Chip design",
  fab: "Chip factory",
  equipment: "Chipmaking equipment",
  memory: "Memory",
};

export const opennessLabels: Record<(typeof OPENNESS)[number], string> = {
  closed: "Closed",
  "open-weights": "Open weights",
  "open-source": "Open source",
};
