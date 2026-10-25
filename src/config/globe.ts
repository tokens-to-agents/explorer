/**
 * Looks of the globe. Adding a look = one entry here (+ its images in public/textures/).
 * Textures: NASA Blue Marble and Black Marble imagery, as shipped with three-globe (MIT).
 */
export type GlobeStyle = {
  id: string;
  label: string;
  /** Surface image. Without one, the globe is a dark sphere with dotted land. */
  surface?: string;
  /** Grayscale elevation map: gives relief to mountains under the light. */
  relief?: string;
  /** White = water: makes oceans reflect the light. */
  water?: string;
  /** The surface image also emits light (city lights stay bright on the dark side). */
  glow?: boolean;
  /** Background of the whole map view (CSS). */
  sky?: string;
  atmosphere: string;
};

export const globeStyles: GlobeStyle[] = [
  {
    id: "night",
    label: "Night",
    surface: "/textures/earth-night.jpg",
    glow: true,
    relief: "/textures/earth-topology.png",
    water: "/textures/earth-water.png",
    sky: "/textures/night-sky.png",
    atmosphere: "#7EAAD4",
  },
  {
    id: "day",
    label: "Day",
    surface: "/textures/earth-blue-marble.jpg",
    relief: "/textures/earth-topology.png",
    water: "/textures/earth-water.png",
    sky: "/textures/night-sky.png",
    atmosphere: "#9cc3ea",
  },
  { id: "minimal", label: "Minimal", atmosphere: "#7EAAD4" },
];

export const defaultGlobeStyle = "night";
