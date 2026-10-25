"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import { MeshPhongMaterial } from "three";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import worldTopology from "world-atlas/countries-110m.json";
import type { MapCountry, MapPoint, MapSelection } from "./types";

type CountryFeature = Feature<Geometry, { name: string }> & { id?: string | number };

const topology = worldTopology as unknown as Topology<{ countries: GeometryCollection<{ name: string }> }>;
const land = (feature(topology, topology.objects.countries) as FeatureCollection<Geometry, { name: string }>)
  .features.map(withoutDegeneratePolygons) as CountryFeature[];

/**
 * The 110m world file keeps a few rings collapsed to a single point by simplification
 * (North Korea has one). The hex-dot layer (h3) throws on them, so they are dropped here.
 */
function withoutDegeneratePolygons<T extends Feature<Geometry>>(country: T): T {
  if (country.geometry.type !== "MultiPolygon") return country;
  const isRealRing = (ring: number[][]) => new Set(ring.map((point) => point.join(","))).size >= 3;
  const coordinates = country.geometry.coordinates.filter((polygon) => polygon[0] !== undefined && isRealRing(polygon[0]));
  return { ...country, geometry: { ...country.geometry, coordinates } };
}

const LAND_DOTS = "rgba(236, 232, 232, 0.26)";
const COUNTRY_STROKE = "rgba(236, 232, 232, 0.18)";

function withAlpha(hex: string, alpha: number) {
  const value = Number.parseInt(hex.slice(1), 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
}

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function tooltip(title: string, subtitle: string) {
  return `<div style="padding:8px 12px;border-radius:12px;background:rgba(25,25,26,0.72);border:1px solid rgba(236,232,232,0.16);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);font:500 12px/1.4 var(--font-geist-sans),system-ui;color:#ECE8E8"><div>${escapeHtml(title)}</div><div style="color:rgba(223,217,217,0.62)">${escapeHtml(subtitle)}</div></div>`;
}

type GlobeCanvasProps = {
  points: MapPoint[];
  countries: MapCountry[];
  selection: MapSelection | null;
  onHover: (selection: MapSelection | null) => void;
  onSelect: (selection: MapSelection | null) => void;
};

/** The WebGL globe. Client-only: loaded through next/dynamic by MapExplorer. */
export default function GlobeCanvas({ points, countries, selection, onHover, onSelect }: GlobeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const material = useMemo(
    () => new MeshPhongMaterial({ color: "#202023", emissive: "#121214", emissiveIntensity: 0.7, shininess: 6 }),
    [],
  );

  const countryByIso = useMemo(() => new Map(countries.map((country) => [country.iso, country])), [countries]);
  const countryShapes = useMemo(
    () => land.filter((shape) => shape.id !== undefined && countryByIso.has(String(shape.id))),
    [countryByIso],
  );

  // Slow auto-rotation that stops while the reader is pointing at something.
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe || size.width === 0) return;
    const controls = globe.controls();
    controls.autoRotate = selection === null;
    controls.autoRotateSpeed = 0.35;
  }, [selection, size.width]);

  const handleReady = () => {
    globeRef.current?.pointOfView({ lat: 28, lng: 20, altitude: 2.3 }, 0);
  };

  const selectedPoint = selection?.type === "point" ? selection.item : null;
  const selectedIso = selection?.type === "country" ? selection.item.iso : null;

  const asPoint = (object: object) => object as MapPoint;
  const asShape = (object: object) => object as CountryFeature;
  const countryOf = (object: object) => countryByIso.get(String(asShape(object).id));

  return (
    <div ref={containerRef} className="absolute inset-0">
      {size.width > 0 && (
        <Globe
          ref={globeRef}
          width={size.width}
          height={size.height}
          onGlobeReady={handleReady}
          backgroundColor="rgba(0,0,0,0)"
          globeMaterial={material}
          showAtmosphere
          atmosphereColor="#7EAAD4"
          atmosphereAltitude={0.16}
          hexPolygonsData={land}
          hexPolygonResolution={3}
          hexPolygonMargin={0.55}
          hexPolygonUseDots
          hexPolygonColor={() => LAND_DOTS}
          polygonsData={countryShapes}
          polygonAltitude={(object) => (String(asShape(object).id) === selectedIso ? 0.014 : 0.006)}
          polygonCapColor={(object) => {
            const country = countryOf(object);
            if (!country) return "rgba(0,0,0,0)";
            return withAlpha(country.color, country.iso === selectedIso ? 0.55 : 0.32);
          }}
          polygonSideColor={() => "rgba(0,0,0,0)"}
          polygonStrokeColor={() => COUNTRY_STROKE}
          polygonLabel={(object) => {
            const country = countryOf(object);
            return country ? tooltip(country.name, country.label) : "";
          }}
          onPolygonHover={(object) => {
            const country = object ? countryOf(object) : undefined;
            onHover(country ? { type: "country", item: country } : null);
          }}
          onPolygonClick={(object) => {
            const country = countryOf(object);
            if (country) onSelect({ type: "country", item: country });
          }}
          pointsData={points}
          pointLat={(object) => asPoint(object).lat}
          pointLng={(object) => asPoint(object).lon}
          pointColor={(object) => asPoint(object).color}
          pointAltitude={(object) => (asPoint(object).id === selectedPoint?.id ? 0.12 : 0.05)}
          pointRadius={0.42}
          pointResolution={16}
          pointsMerge={false}
          pointLabel={(object) => tooltip(asPoint(object).name, `${asPoint(object).kind} · ${asPoint(object).location}`)}
          onPointHover={(object) => onHover(object ? { type: "point", item: asPoint(object) } : null)}
          onPointClick={(object) => onSelect({ type: "point", item: asPoint(object) })}
          onGlobeClick={() => onSelect(null)}
          ringsData={selectedPoint ? [selectedPoint] : []}
          ringLat={(object) => asPoint(object).lat}
          ringLng={(object) => asPoint(object).lon}
          ringColor={(object: object) => (t: number) => withAlpha(asPoint(object).color, 1 - t)}
          ringMaxRadius={3.2}
          ringPropagationSpeed={2.2}
          ringRepeatPeriod={900}
        />
      )}
    </div>
  );
}
