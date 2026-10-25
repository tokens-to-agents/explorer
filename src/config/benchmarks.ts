/**
 * Benchmarks shown as columns of the Models table, in this order.
 * Adding a benchmark = one entry here + its rows in data/benchmarks.csv.
 * Prefer independent leaderboards (same test run by a third party on every model) over vendor-reported numbers.
 */
export type BenchmarkConfig = {
  id: string;
  label: string;
  /** Shown when the reader points at the column header. */
  description: string;
  url: string;
  /** How to print a score. */
  format: "integer" | "percent";
};

export const benchmarks: BenchmarkConfig[] = [
  {
    id: "aa-index",
    label: "Intelligence Index",
    description:
      "Artificial Analysis runs the same set of hard tests (reasoning, knowledge, coding, agent tasks) on every model and averages them. Independent. Higher is better.",
    url: "https://artificialanalysis.ai/leaderboards/models",
    format: "integer",
  },
  {
    id: "lmarena-text",
    label: "Arena (text)",
    description:
      "LMArena: people compare two anonymous answers to the same prompt and vote; the votes give an Elo-style rating. Measures preference, not correctness. Higher is better.",
    url: "https://lmarena.ai/leaderboard/text",
    format: "integer",
  },
];
