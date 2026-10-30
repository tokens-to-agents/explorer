import { site } from "./site";

/**
 * Wiki pages the Explorer links back to. `path` follows wiki-tree.md (without `.md`).
 * Set `live: true` once the page is published in GitBook; until then the link opens the wiki home.
 */
export type WikiPage = { title: string; path: string; live: boolean };

export const wikiPages = {
  home: { title: "Wiki home", path: "", live: true },
  foundations: { title: "Foundations", path: "foundations/overview", live: true },
  historyOverview: { title: "History", path: "history/overview", live: true },
  languageModels: { title: "Language models", path: "models/language-models", live: false },
  labs: { title: "Labs", path: "ecosystem/labs", live: false },
  dataCenters: { title: "Data centers", path: "infrastructure/compute/data-centers", live: false },
  chipSupplyChain: { title: "Chip supply chain", path: "infrastructure/compute/chip-supply-chain", live: false },
  regulation: { title: "Regulation", path: "society/regulation", live: false },
  energy: { title: "Energy", path: "infrastructure/compute/energy", live: false },
  geopolitics: { title: "Geopolitics", path: "infrastructure/geopolitics", live: false },
  investment: { title: "Investment", path: "infrastructure/investment", live: false },
  earlyAi: { title: "Early AI", path: "history/overview/early-ai-1943-1992", live: true },
  machineLearning: { title: "Machine learning", path: "history/overview/machine-learning-1993-2011", live: true },
  deepLearning: { title: "Deep learning", path: "history/overview/deep-learning-2012-2016", live: true },
  transformers: { title: "Transformers", path: "history/overview/transformers-2017-2021", live: true },
  generativeAi: { title: "Generative AI", path: "history/overview/generative-ai-2022-2023", live: true },
  reasoningAgents: { title: "Reasoning & agents", path: "history/overview/reasoning-and-agents-2024-today", live: true },
} satisfies Record<string, WikiPage>;

export type WikiPageKey = keyof typeof wikiPages;

export function wikiHref(key: WikiPageKey): string {
  const page: WikiPage = wikiPages[key];
  if (!page.live || page.path === "") return site.wikiUrl;
  return `${site.wikiUrl}/${page.path}`;
}
