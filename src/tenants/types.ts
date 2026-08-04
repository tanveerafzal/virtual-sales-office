export type LotStatus = "available" | "reserved" | "sold" | "tba";

export type AssetKind = "exterior" | "interior" | "site";

/** Slot for a human-delivered 3D (or still) asset. */
export type TenantAsset = {
  id: string;
  kind: AssetKind;
  /** Public URL path, e.g. /tenants/cedar-hedge/assets/exteriors/athabasca.glb */
  src: string;
  label: string;
  /** Model code this asset belongs to, if any */
  modelCode?: string;
  /** true once the file is checked in; false shows placeholder in explore */
  ready: boolean;
  format?: "glb" | "gltf" | "image" | "hdr";
  notes?: string;
};

export type HomeModel = {
  code: string;
  name: string;
  elevation: string;
  sqft: string;
  plan: string;
  /** Marketing list price (CAD). Do not invent — from pricing source. */
  price?: number;
  pricingAfterRebate?: number;
  beds?: string;
  baths?: string;
  exteriorAssetId?: string;
  interiorAssetId?: string;
};

export type Lot = {
  id: string;
  label: string;
  status: LotStatus;
  /** Optional site-plan coords 0–1 for overlay */
  x?: number;
  y?: number;
  premium?: number;
  modelCode?: string;
};

/** Clickable room zone on a 2D floor plan (percent of image box). */
export type FloorHotspot = {
  id: string;
  label: string;
  /** Left / top / width / height as % of plan image (0–100) */
  x: number;
  y: number;
  w: number;
  h: number;
  dims?: string;
  /** Future: bind click → interior 3D scene / GLB slot */
  sceneId?: string;
  notes?: string;
};

export type FloorPlanLevel = {
  id: string;
  label: string;
  /** Public path under /tenants/... */
  imageSrc: string;
  description?: string;
  hotspots: FloorHotspot[];
};

export type TenantTheme = {
  background: string;
  foreground: string;
  muted: string;
  accent: string;
  accentSoft: string;
  gold: string;
  surface: string;
  gradientFrom: string;
  gradientTo: string;
};

export type TenantContact = {
  email: string;
  phone: string[];
  office?: string;
  website?: string;
};

export type TenantConfig = {
  slug: string;
  builderName: string;
  communityName: string;
  tagline: string;
  location: string;
  productSummary: string;
  theme: TenantTheme;
  contact: TenantContact;
  disclaimer: string;
  models: HomeModel[];
  lots: Lot[];
  assets: TenantAsset[];
  /** Shared 2D interior plans (click rooms → future 3D hookup) */
  floorPlans: FloorPlanLevel[];
  documents: { label: string; href: string }[];
};
