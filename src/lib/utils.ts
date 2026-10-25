import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Formats a partial ISO date (YYYY, YYYY-MM or YYYY-MM-DD) without inventing precision. */
export function formatPartialDate(date: string): string {
  const [year, month, day] = date.split("-");
  if (!month) return year ?? date;
  const monthLabel = MONTHS[Number(month) - 1] ?? month;
  return day ? `${Number(day)} ${monthLabel} ${year}` : `${monthLabel} ${year}`;
}

/** Sortable key for a partial date: missing parts sort first within their year or month. */
export function partialDateKey(date: string): string {
  const [year = "0000", month = "00", day = "00"] = date.split("-");
  return `${year}-${month}-${day}`;
}

export function yearOf(date: string): number {
  return Number(date.slice(0, 4));
}

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 0 });
const compactPrecise = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

/** 131072 → "131K", 1048576 → "1M", 2500000 → "2.5M". */
export function formatTokens(value: number | undefined): string {
  if (value === undefined) return "—";
  return (value >= 1_000_000 ? compactPrecise : compact).format(value);
}

export function formatBillions(value: number | undefined): string {
  if (value === undefined) return "—";
  return value >= 1000 ? `${(value / 1000).toLocaleString("en", { maximumFractionDigits: 2 })} T` : `${value.toLocaleString("en")} B`;
}

export function formatUsd(value: number | undefined): string {
  return value === undefined ? "—" : `$${value.toLocaleString("en", { maximumFractionDigits: 2 })}`;
}
