"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { MousePointerClick } from "lucide-react";
import { FilterChip } from "@/components/filter-chip";
import { SwatchBadge } from "@/components/ui/badge";
import { SourceLink, WikiLink } from "@/components/wiki-link";
import { defaultGlobeStyle, globeStyles } from "@/config/globe";
import { flowKinds, regulationLevels } from "@/config/taxonomy";
import { cn, formatPartialDate } from "@/lib/utils";
import type { MapCountry, MapFlow, MapLayerState, MapPoint, MapSelection } from "./types";

const GlobeCanvas = dynamic(() => import("./globe-canvas"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">Loading the globe…</div>
  ),
});

type MapExplorerProps = { points: MapPoint[]; countries: MapCountry[]; flows: MapFlow[]; layers: MapLayerState[] };

/**
 * Full-screen map: the globe fills the window, the panel on the left holds the look, the layers,
 * their legends and the details of what the reader points at.
 */
export function MapExplorer({ points, countries, flows, layers }: MapExplorerProps) {
  const [lookId, setLookId] = useState(defaultGlobeStyle);
  const look = globeStyles.find((style) => style.id === lookId) ?? globeStyles[0]!;
  const [active, setActive] = useState<Set<string>>(
    () => new Set(layers.filter((layer) => layer.status === "live" && layer.defaultOn).map((layer) => layer.id)),
  );
  const [hovered, setHovered] = useState<MapSelection | null>(null);
  const [pinned, setPinned] = useState<MapSelection | null>(null);
  const shown = hovered ?? pinned;

  const visiblePoints = useMemo(() => points.filter((point) => active.has(point.layerId)), [points, active]);
  const visibleCountries = useMemo(() => countries.filter((country) => active.has(country.layerId)), [countries, active]);
  const visibleFlows = useMemo(() => flows.filter((flow) => active.has(flow.layerId)), [flows, active]);

  const toggle = (id: string, on: boolean) => {
    setActive((current) => {
      const next = new Set(current);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
    setPinned(null);
  };

  const flowsOn = layers.some((layer) => layer.kind === "flows" && active.has(layer.id));
  const countriesOn = layers.some((layer) => layer.kind === "countries" && active.has(layer.id));

  return (
    <div
      className="fixed inset-0 bg-background bg-cover bg-center"
      style={
        look.sky
          ? { backgroundImage: `linear-gradient(rgb(25 25 26 / 0.5), rgb(25 25 26 / 0.5)), url(${look.sky})` }
          : undefined
      }
    >
      {/* The globe centers in the space the panel leaves free: above it on phones, to its right on large screens. */}
      <div className="absolute inset-x-0 top-16 bottom-[40dvh] lg:top-0 lg:bottom-0 lg:left-[23rem] xl:left-0">
        <GlobeCanvas
          key={look.id}
          look={look}
          points={visiblePoints}
          countries={visibleCountries}
          flows={visibleFlows}
          selection={shown}
          onHover={setHovered}
          onSelect={setPinned}
        />
      </div>

      <aside
        aria-label="Map controls and details"
        className="glass-bar absolute inset-x-3 bottom-3 z-10 flex max-h-[38dvh] flex-col gap-5 overflow-y-auto rounded-xl p-5 lg:inset-x-auto lg:top-[5.5rem] lg:bottom-auto lg:left-4 lg:max-h-[calc(100dvh-6.5rem)] lg:w-[21rem]"
      >
        <header className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight">Map</h1>
          <p className="text-sm text-muted-foreground">Where AI is built, powered and regulated.</p>
        </header>

        <section className="space-y-2.5">
          <h2 className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">Look</h2>
          <div role="group" aria-label="Globe look" className="inline-flex rounded-full border p-0.5">
            {globeStyles.map((style) => (
              <button
                key={style.id}
                type="button"
                aria-pressed={style.id === look.id}
                onClick={() => setLookId(style.id)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs transition-colors",
                  style.id === look.id ? "bg-glass-strong text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {style.label}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-2.5">
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
          {flowsOn && (
            <Legend title="Chip flows">
              {Object.values(flowKinds).map((kind) => (
                <SwatchBadge key={kind.label} color={kind.color} label={kind.label} />
              ))}
            </Legend>
          )}
          {countriesOn && (
            <Legend title="Regulation">
              {Object.values(regulationLevels).map((level) => (
                <SwatchBadge key={level.label} color={level.color} label={level.label} />
              ))}
            </Legend>
          )}
        </section>

        <section aria-live="polite" className="border-t pt-5">
          {shown ? <Details selection={shown} /> : <Hint />}
        </section>
      </aside>
    </div>
  );
}

function Legend({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5 pt-1">
      <p className="text-xs text-faint-foreground">{title}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Hint() {
  return (
    <div className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
      <MousePointerClick className="mt-0.5 size-4 shrink-0" />
      <p>Point at a dot, an arc or a country to see what it is. Click to keep it selected; drag to turn the globe.</p>
    </div>
  );
}

/** One shape for the three kinds of things the reader can point at. */
function describe(selection: MapSelection) {
  switch (selection.type) {
    case "point":
      return { ...selection.item, subtitle: `${selection.item.kind} · ${selection.item.location}`, facts: selection.item.facts };
    case "country":
      return { ...selection.item, subtitle: selection.item.label, facts: [] };
    case "flow":
      return {
        ...selection.item,
        name: `${selection.item.from.name} → ${selection.item.to.name}`,
        subtitle: selection.item.kindLabel,
        note: selection.item.label,
        facts: [],
      };
  }
}

function Details({ selection }: { selection: MapSelection }) {
  const item = describe(selection);

  return (
    <article className="space-y-4">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
          <h3 className="text-lg font-semibold tracking-tight">{item.name}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{item.subtitle}</p>
      </header>

      {item.facts.length > 0 && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          {item.facts.map((fact) => (
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
