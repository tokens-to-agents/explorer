/**
 * Site-wide settings. Change the name, the wiki address or the navigation here only.
 */
export const site = {
  name: "Tokens to Agents",
  product: "Explorer",
  description:
    "The interactive companion of the Tokens to Agents wiki: a world map of AI, a timeline of the field and sortable model tables.",
  wikiUrl: "https://tokens-to-agents.gitbook.io/wiki",
} as const;

export type NavItem = {
  href: string;
  label: string;
  description: string;
  status: "live" | "planned";
};

export const nav: NavItem[] = [
  { href: "/map", label: "Map", description: "Labs, data centers, the chip supply chain and AI rules on a globe.", status: "live" },
  { href: "/timeline", label: "Timeline", description: "From the first artificial neuron (1943) to today, filtered by topic.", status: "live" },
  { href: "/models", label: "Models", description: "Every tracked model in one sortable table: size, context, price.", status: "live" },
  { href: "/explainers", label: "Explainers", description: "Animations that follow one token, one weight, one agent loop.", status: "planned" },
  { href: "/calculators", label: "Calculators", description: "Will this model fit on my machine? What will this API cost?", status: "planned" },
];
