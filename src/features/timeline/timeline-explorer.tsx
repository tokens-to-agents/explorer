"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp, Search } from "lucide-react";
import { FilterChip } from "@/components/filter-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SourceLink, WikiLink } from "@/components/wiki-link";
import { eraOfYear, eras, TAG_IDS, tags, type TagId } from "@/config/taxonomy";
import type { TimelineEvent } from "@/lib/data/schema";
import { formatPartialDate, partialDateKey, yearOf } from "@/lib/utils";

export function TimelineExplorer({ events }: { events: TimelineEvent[] }) {
  const [activeTags, setActiveTags] = useState<Set<TagId>>(() => new Set(TAG_IDS));
  const [query, setQuery] = useState("");
  const [newestFirst, setNewestFirst] = useState(false);

  const counts = useMemo(() => {
    const result = Object.fromEntries(TAG_IDS.map((id) => [id, 0])) as Record<TagId, number>;
    for (const event of events) for (const tag of event.tags) result[tag] += 1;
    return result;
  }, [events]);

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = events
      .filter((event) => event.tags.some((tag) => activeTags.has(tag)))
      .filter((event) => !needle || event.title.toLowerCase().includes(needle) || event.date.startsWith(needle))
      .sort((a, b) => partialDateKey(a.date).localeCompare(partialDateKey(b.date)));
    if (newestFirst) filtered.reverse();

    const orderedEras = newestFirst ? [...eras].reverse() : eras;
    return orderedEras
      .map((era) => ({ era, items: filtered.filter((event) => eraOfYear(yearOf(event.date)).id === era.id) }))
      .filter((group) => group.items.length > 0);
  }, [events, activeTags, query, newestFirst]);

  const toggleTag = (id: TagId, on: boolean) =>
    setActiveTags((current) => {
      const next = new Set(current);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  const shown = groups.reduce((total, group) => total + group.items.length, 0);

  return (
    <div className="space-y-8">
      <div className="glass-bar z-30 flex flex-col gap-3 rounded-xl p-4 md:sticky md:top-24 md:flex-row md:items-center">
        <div className="flex flex-wrap gap-2">
          {TAG_IDS.map((id) => (
            <FilterChip
              key={id}
              label={tags[id].label}
              color={tags[id].color}
              count={counts[id]}
              hint={
                <>
                  <span className="text-foreground">{tags[id].label}:</span> {tags[id].description} Explained in{" "}
                  {tags[id].section}.
                </>
              }
              pressed={activeTags.has(id)}
              onPressedChange={(on) => toggleTag(id, on)}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 md:ml-auto">
          <div className="relative w-full md:w-56">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3.5 size-3.5 -translate-y-1/2 text-faint-foreground"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search events or a year"
              aria-label="Search events"
              className="pl-9"
            />
          </div>
          <Button
            variant="glass"
            size="icon"
            onClick={() => setNewestFirst((value) => !value)}
            aria-label={newestFirst ? "Show oldest first" : "Show newest first"}
            title={newestFirst ? "Oldest first" : "Newest first"}
          >
            <ArrowDownUp />
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {shown} of {events.length} events · an event can carry several tags; point at a tag to see what it covers.
      </p>

      <div className="space-y-12">
        {groups.map(({ era, items }) => (
          <section key={era.id} aria-labelledby={`era-${era.id}`} className="grid gap-6 md:grid-cols-[13rem_1fr]">
            <header className="space-y-3 md:sticky md:top-48 md:self-start">
              <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase tabular-nums">
                {era.from} – {era.to ?? "today"}
              </p>
              <h2 id={`era-${era.id}`} className="text-xl font-semibold tracking-tight">
                {era.label}
              </h2>
              <WikiLink page={era.wiki} compact />
            </header>

            <ol className="relative space-y-3 border-l border-border-strong pl-6">
              {items.map((event) => (
                <li key={event.id} className="relative">
                  <span
                    aria-hidden
                    className="absolute top-5 -left-[29px] size-2.5 rounded-full ring-4 ring-background"
                    style={{ backgroundColor: tags[event.tags[0]!].color }}
                  />
                  <article className="glass flex flex-col gap-2 rounded-lg px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
                    <time dateTime={event.date} className="w-28 shrink-0 text-sm text-muted-foreground tabular-nums">
                      {formatPartialDate(event.date)}
                    </time>
                    <p className="flex-1 text-sm leading-relaxed">{event.title}</p>
                    <div className="flex items-center gap-3">
                      <ul aria-label="Tags" className="flex flex-wrap justify-end gap-x-2.5 gap-y-1">
                        {event.tags.map((tag) => (
                          <li
                            key={tag}
                            className="text-xs"
                            style={{ color: tags[tag].color }}
                            title={tags[tag].description}
                          >
                            {tags[tag].label}
                          </li>
                        ))}
                      </ul>
                      <SourceLink href={event.source} />
                    </div>
                  </article>
                </li>
              ))}
            </ol>
          </section>
        ))}
        {groups.length === 0 && <p className="text-sm text-muted-foreground">No event matches these filters.</p>}
      </div>
    </div>
  );
}
