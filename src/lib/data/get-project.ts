import { asc, eq } from "drizzle-orm";
import { getDb, hasDatabaseUrl } from "@/db";
import {
  designs3d,
  homeModels,
  partners,
  planHotspots,
  planLevels,
  projectDocuments,
  projects,
} from "@/db/schema";
import { mapProjectToTenant } from "@/lib/data/map-project";
import { getTenant as getStaticTenant, listTenants as listStaticTenants } from "@/tenants/registry";
import type { TenantConfig } from "@/tenants/types";

export async function listProjectSlugs(): Promise<string[]> {
  if (!hasDatabaseUrl()) {
    return listStaticTenants().map((t) => t.slug);
  }

  try {
    const db = getDb();
    const rows = await db
      .select({ slug: projects.slug })
      .from(projects)
      .where(eq(projects.published, true));
    if (rows.length === 0) return listStaticTenants().map((t) => t.slug);
    return rows.map((r) => r.slug);
  } catch (err) {
    console.error("listProjectSlugs failed, using static tenants", err);
    return listStaticTenants().map((t) => t.slug);
  }
}

export async function listProjectsAsTenants(): Promise<TenantConfig[]> {
  const slugs = await listProjectSlugs();
  const tenants: TenantConfig[] = [];
  for (const slug of slugs) {
    const t = await getProjectAsTenant(slug);
    if (t) tenants.push(t);
  }
  return tenants;
}

export async function getProjectAsTenant(
  slug: string,
): Promise<TenantConfig | undefined> {
  if (!hasDatabaseUrl()) {
    return getStaticTenant(slug);
  }

  try {
    const db = getDb();
    const [row] = await db
      .select({
        project: projects,
        partner: partners,
      })
      .from(projects)
      .innerJoin(partners, eq(projects.partnerId, partners.id))
      .where(eq(projects.slug, slug))
      .limit(1);

    if (!row || !row.project.published) {
      return getStaticTenant(slug);
    }

    const models = await db
      .select()
      .from(homeModels)
      .where(eq(homeModels.projectId, row.project.id))
      .orderBy(asc(homeModels.sortOrder));

    const designs = await db
      .select()
      .from(designs3d)
      .where(eq(designs3d.projectId, row.project.id));

    const levels = await db
      .select()
      .from(planLevels)
      .where(eq(planLevels.projectId, row.project.id))
      .orderBy(asc(planLevels.sortOrder));

    const levelsWithHotspots = await Promise.all(
      levels.map(async (level) => {
        const hotspots = await db
          .select()
          .from(planHotspots)
          .where(eq(planHotspots.planLevelId, level.id));
        return { ...level, hotspots };
      }),
    );

    const documents = await db
      .select()
      .from(projectDocuments)
      .where(eq(projectDocuments.projectId, row.project.id))
      .orderBy(asc(projectDocuments.sortOrder));

    return mapProjectToTenant({
      partner: {
        name: row.partner.name,
        email: row.partner.email,
        phone: (row.partner.phone as string[] | null) ?? [],
        office: row.partner.office,
        website: row.partner.website,
      },
      project: {
        slug: row.project.slug,
        name: row.project.name,
        tagline: row.project.tagline,
        location: row.project.location,
        productSummary: row.project.productSummary,
        disclaimer: row.project.disclaimer,
        theme: row.project.theme as Record<string, string>,
        contact: row.project.contact,
      },
      models,
      designs,
      planLevels: levelsWithHotspots,
      documents,
    });
  } catch (err) {
    console.error(`getProjectAsTenant(${slug}) failed, using static`, err);
    return getStaticTenant(slug);
  }
}
