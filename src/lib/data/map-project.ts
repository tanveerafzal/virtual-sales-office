import type {
  AssetKind,
  FloorPlanLevel,
  HomeModel,
  TenantAsset,
  TenantConfig,
  TenantContact,
  TenantTheme,
} from "@/tenants/types";

type PartnerRow = {
  name: string;
  email: string | null;
  phone: string[] | null;
  office: string | null;
  website: string | null;
};

type ProjectRow = {
  slug: string;
  name: string;
  tagline: string;
  location: string;
  productSummary: string;
  disclaimer: string;
  theme: Record<string, string>;
  contact: {
    email?: string;
    phone?: string[];
    office?: string;
    website?: string;
  } | null;
};

type ModelRow = {
  id: string;
  code: string;
  name: string;
  elevation: string;
  sqft: string;
  planLabel: string;
  priceCents: number | null;
  pricingAfterRebateCents: number | null;
  beds: string | null;
  baths: string | null;
};

type DesignRow = {
  id: string;
  modelId: string | null;
  kind: "exterior" | "interior" | "site" | "room";
  sceneKey: string;
  label: string;
  src: string;
  format: string;
  ready: boolean;
  notes: string | null;
};

type PlanLevelRow = {
  id: string;
  slug: string;
  label: string;
  imageSrc: string;
  description: string | null;
  hotspots: {
    id: string;
    slug: string;
    label: string;
    x: string;
    y: string;
    w: string;
    h: string;
    dims: string | null;
    notes: string | null;
    sceneKey: string | null;
    design3dId: string | null;
  }[];
};

type DocumentRow = { label: string; href: string };

function centsToDollars(cents: number | null | undefined): number | undefined {
  if (cents == null) return undefined;
  return Math.round(cents / 100);
}

function toNum(v: string): number {
  return Number(v);
}

export function mapProjectToTenant(input: {
  partner: PartnerRow;
  project: ProjectRow;
  models: ModelRow[];
  designs: DesignRow[];
  planLevels: PlanLevelRow[];
  documents: DocumentRow[];
}): TenantConfig {
  const { partner, project, models, designs, planLevels, documents } = input;

  const theme = project.theme as unknown as TenantTheme;
  const contact: TenantContact = {
    email: project.contact?.email ?? partner.email ?? "",
    phone: project.contact?.phone ?? partner.phone ?? [],
    office: project.contact?.office ?? partner.office ?? undefined,
    website: project.contact?.website ?? partner.website ?? undefined,
  };

  const assets: TenantAsset[] = designs.map((d) => {
    const kind: AssetKind =
      d.kind === "room" ? "interior" : (d.kind as AssetKind);
    const model = models.find((m) => m.id === d.modelId);
    return {
      id: d.id,
      kind,
      src: d.src,
      label: d.label,
      modelCode: model?.code,
      ready: d.ready,
      format: (d.format as TenantAsset["format"]) ?? "glb",
      notes: d.notes ?? undefined,
    };
  });

  const exteriorByElevation = new Map<string, string>();
  const interiorByElevation = new Map<string, string>();
  for (const d of designs) {
    if (!d.modelId) continue;
    const model = models.find((m) => m.id === d.modelId);
    if (!model) continue;
    if (d.kind === "exterior" && !exteriorByElevation.has(model.elevation)) {
      exteriorByElevation.set(model.elevation, d.id);
    }
    if (d.kind === "interior" && !interiorByElevation.has(model.elevation)) {
      interiorByElevation.set(model.elevation, d.id);
    }
  }

  const homeModels: HomeModel[] = models.map((m) => ({
    code: m.code,
    name: m.name,
    elevation: m.elevation,
    sqft: m.sqft,
    plan: m.planLabel,
    price: centsToDollars(m.priceCents),
    pricingAfterRebate: centsToDollars(m.pricingAfterRebateCents),
    beds: m.beds ?? undefined,
    baths: m.baths ?? undefined,
    exteriorAssetId: exteriorByElevation.get(m.elevation),
    interiorAssetId: interiorByElevation.get(m.elevation),
  }));

  const floorPlans: FloorPlanLevel[] = planLevels.map((level) => ({
    id: level.slug,
    label: level.label,
    imageSrc: level.imageSrc,
    description: level.description ?? undefined,
    hotspots: level.hotspots.map((h) => ({
      id: h.slug,
      label: h.label,
      x: toNum(h.x),
      y: toNum(h.y),
      w: toNum(h.w),
      h: toNum(h.h),
      dims: h.dims ?? undefined,
      notes: h.notes ?? undefined,
      sceneId: h.sceneKey ?? h.design3dId ?? undefined,
    })),
  }));

  return {
    slug: project.slug,
    builderName: partner.name,
    communityName: project.name,
    tagline: project.tagline,
    location: project.location,
    productSummary: project.productSummary,
    theme,
    contact,
    disclaimer: project.disclaimer,
    models: homeModels,
    lots: [],
    assets,
    floorPlans,
    documents: documents.map((d) => ({ label: d.label, href: d.href })),
  };
}
