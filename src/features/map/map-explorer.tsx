"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { MousePointerClick } from "lucide-react";
import { FilterChip } from "@/components/filter-chip";
import { SwatchBadge } from "@/components/ui/badge";
import { SourceLink, WikiLink } from "@/components/wiki-link";
import { regulationLevels } from "@/config/taxonomy";
import { formatPartialDate } from "@/lib/utils";
import type { MapCountry, MapLayerState, MapPoint, MapSelection } from "./types";

const GlobeCanvas = dynamic(() => import("./globe-canvas"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">Loading the globe…</div>
  ),
});

type MapExplorerProps = { points: MapPoint[]; countries: MapCountry[]; layers: MapLayerState[] };

export function MapExplorer({ points, countries, layers }: MapExplorerProps) {
  const [active, setActive] = useState<Set<string>>(
    () => new Set(layers.filter((layer) => layer.status === "live" && layer.defaultOn).map((layer) => layer.id)),
  );
  const [hovered, setHovered] = useState<MapSelection | null>(null);
  const [pinned, setPinned] = useState<MapSelection | null>(null);
  const shown = hovered ?? pinned;

  const visiblePoints = useMemo(() => points.filter((point) => active.has(point.layerId)), [points, active]);
  const visibleCountries = useMemo(() => countries.filter((country) => active.has(country.layerId)), [countries, active]);

  const toggle = (id: string, on: boolean) => {
    setActive((current) => {
      const next = new Set(current);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
    setPinned(null);
  };

  return (
    <div className="relative grid gap-4 lg:block">
      <div className="glass relative h-[62dvh] min-h-[420px] overflow-hidden rounded-xl lg:h-[74dvh] lg:min-h-[560px]">
        {/* On large screens the panel floats on the left, so the globe centers in the space to its right. */}
        <div className="absolute inset-0 lg:left-84">
          <GlobeCanvas
            points={visiblePoints}
            countries={visibleCountries}
            selection={shown}
            onHover={setHovered}
            onSelect={setPinned}
          />
        </div>
      </div>

      <aside
        aria-label="Map layers and details"
        className="glass-strong flex flex-col gap-5 rounded-xl p-5 lg:absolute lg:top-4 lg:bottom-4 lg:left-4 lg:w-80 lg:overflow-y-auto"
      >
        <section className="space-y-3">
          <h2 className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">Layers</h2>
          <div className="flex flex-wrap gap-2">
            {layers.map((layer) =>
              layer.status === "live" ? (
                <FilterChip
                  key={layer.id}
                  label={layer.label}
                  color={layer.color}
                  count={layer.count}
                  pressed={active.has(layer.id)}
                  onPressedChange={(on) => toggle(layer.id, on)}
                />
              ) : (
                <FilterChip key={layer.id} label={`${layer.label} · soon`} pressed={false} disabled onPressedChange={() => {}} />
              ),
            )}
          </div>
          {active.has("regulation") && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {Object.values(regulationLevels).map((level) => (
                <SwatchBadge key={level.label} color={level.color} label={level.label} />
              ))}
            </div>
          )}
        </section>

        <section aria-live="polite" className="border-t pt-5">
          {shown ? <Details selection={shown} /> : <Hint />}
        </section>
      </aside>
    </div>
  );
}

function Hint() {
  return (
    <div className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
      <MousePointerClick className="mt-0.5 size-4 shrink-0" />
      <p>Point at a dot or a country to see what it is. Click to keep it selected; drag to turn the globe.</p>
    </div>
  );
}

function Details({ selection }: { selection: MapSelection }) {
  const item = selection.item;
  const isPoint = selection.type === "point";
  const subtitle = isPoint ? `${selection.item.kind} · ${selection.item.location}` : selection.item.label;
  const color = item.color;

  return (
    <article className="space-y-4">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <span aria-hidden className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
          <h3 className="text-lg font-semibold tracking-tight">{item.name}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </header>

      {isPoint && selection.item.facts.length > 0 && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          {selection.item.facts.map((fact) => (
            <div key={fact.label} className="contents">
              <dt className="text-muted-foreground">{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {item.note && <p className="text-sm leading-relaxed text-muted-foreground">{item.note}</p>}

      <div className="flex items-center gap-3">
        <SourceLink href={item.source} />
        <span className="text-xs text-faint-foreground">
          {item.checked ? `Checked ${formatPartialDate(item.checked)}` : "Not verified yet"}
        </span>
      </div>

      <WikiLink page={item.wiki} />
    </article>
  );
}
