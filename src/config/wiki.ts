import { site } from "./site";

/**
 * Wiki pages the Explorer links back to. `path` follows wiki-tree.md (without `.md`).
 * Set `live: true` once the page is published in GitBook; until then the link opens the wiki home.
 */
export type WikiPage = { title: string; path: string; live: boolean };

export const wikiPages = {
  home: { title: "Wiki home", path: "", live: true },
  foundations: { title: "Foundations", path: "foundations/overview", live: true },
  historyOverview: { title: "History", path: "history/overview", live: false },
  timeline: { title: "Timeline", path: "history/timeline", live: false },
  languageModels: { title: "Language models", path: "models/language-models", live: false },
  labs: { title: "Labs", path: "ecosystem/labs", live: false },
  dataCenters: { title: "Data centers", path: "infrastructure/compute/data-centers", live: false },
  chipSupplyChain: { title: "Chip supply chain", path: "infrastructure/compute/chip-supply-chain", live: false },
  regulation: { title: "Regulation", path: "society/regulation", live: false },
  energy: { title: "Energy", path: "infrastructure/compute/energy", live: false },
  geopolitics: { title: "Geopolitics", path: "infrastructure/geopolitics", live: false },
  investment: { title: "Investment", path: "infrastructure/investment", live: false },
  earlyAi: { title: "Early AI", path: "history/early-ai", live: false },
  machineLearning: { title: "Machine learning", path: "history/machine-learning", live: false },
  deepLearning: { title: "Deep learning", path: "history/deep-learning", live: false },
  transformers: { title: "Transformers", path: "history/transformers", live: false },
  generativeAi: { title: "Generative AI", path: "history/generative-ai", live: false },
  reasoningAgents: { title: "Reasoning & agents", path: "history/reasoning-and-agents", live: false },
} satisfies Record<string, WikiPage>;

export type WikiPageKey = keyof typeof wikiPages;

export function wikiHref(key: WikiPageKey): string {
  const page: WikiPage = wikiPages[key];
  if (!page.live || page.path === "") return site.wikiUrl;
  return `${site.wikiUrl}/${page.path}`;
}
