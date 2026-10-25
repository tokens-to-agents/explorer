import Link from "next/link";
import { ArrowRight, Calculator, Globe2, History, Sparkles, Table2, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WikiLink } from "@/components/wiki-link";
import { nav } from "@/config/site";
import { loadAll } from "@/lib/data/load";
import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = {
  "/map": Globe2,
  "/timeline": History,
  "/models": Table2,
  "/explainers": Sparkles,
  "/calculators": Calculator,
};

export default async function HomePage() {
  const data = await loadAll();
  const stats = [
    { value: data.labs.length, label: "labs" },
    { value: data.places.length, label: "places" },
    { value: data.events.length, label: "events" },
    { value: data.models.length, label: "models" },
  ];

  return (
    <div className="space-y-14">
      <section className="space-y-6 pt-6">
        <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">Tokens to Agents · Explorer</p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance md:text-6xl">
          The field of AI, to explore rather than read.
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
          The wiki explains how AI works. The Explorer lets you turn the globe, filter the timeline and sort the
          models. Both read the same data, and every row links to its source.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <WikiLink page="home" size="default" label="Open the wiki" />
          <div className="flex flex-wrap gap-2">
            {stats.map((stat) => (
              <Badge key={stat.label} variant="outline">
                <span className="text-foreground tabular-nums">{stat.value}</span> {stat.label}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Views" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {nav.map((item) => {
          const Icon = icons[item.href] ?? Sparkles;
          const live = item.status === "live";
          const card = (
            <div
              className={cn(
                "glass group flex h-full flex-col gap-4 rounded-xl p-6 transition-colors",
                live ? "hover:bg-glass-strong" : "opacity-60",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="glass-strong flex size-10 items-center justify-center rounded-full">
                  <Icon className="size-5" />
                </span>
                {live ? (
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                ) : (
                  <Badge variant="outline">Planned</Badge>
                )}
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-semibold tracking-tight">{item.label}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            </div>
          );
          return live ? (
            <Link key={item.href} href={item.href} className="rounded-xl">
              {card}
            </Link>
          ) : (
            <div key={item.href}>{card}</div>
          );
        })}
      </section>
    </div>
  );
}
