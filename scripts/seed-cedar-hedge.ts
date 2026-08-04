/**
 * Seed Smart Castle Homes / Cedar Hedge into Neon from static tenant config.
 *
 *   DATABASE_URL=... npx tsx scripts/seed-cedar-hedge.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { eq } from "drizzle-orm";
import { getDb, hasDatabaseUrl } from "../src/db";
import {
  designs3d,
  homeModels,
  partners,
  planHotspots,
  planLevels,
  projectDocuments,
  projects,
} from "../src/db/schema";
import { cedarHedgeTenant } from "../src/tenants/cedar-hedge/config";

function dollarsToCents(n?: number): number | null {
  if (n == null) return null;
  return Math.round(n * 100);
}

async function main() {
  if (!hasDatabaseUrl()) {
    throw new Error("Set DATABASE_URL before seeding");
  }
  const db = getDb();
  const t = cedarHedgeTenant;

  console.log("Seeding partner + project…");

  const [partner] = await db
    .insert(partners)
    .values({
      slug: "smart-castle-homes",
      name: t.builderName,
      email: t.contact.email,
      phone: t.contact.phone,
      office: t.contact.office,
      website: t.contact.website,
    })
    .onConflictDoUpdate({
      target: partners.slug,
      set: {
        name: t.builderName,
        email: t.contact.email,
        phone: t.contact.phone,
        office: t.contact.office,
        website: t.contact.website,
        updatedAt: new Date(),
      },
    })
    .returning();

  const [project] = await db
    .insert(projects)
    .values({
      partnerId: partner.id,
      slug: t.slug,
      name: t.communityName,
      tagline: t.tagline,
      location: t.location,
      productSummary: t.productSummary,
      disclaimer: t.disclaimer,
      theme: t.theme,
      contact: null,
      published: true,
    })
    .onConflictDoUpdate({
      target: projects.slug,
      set: {
        partnerId: partner.id,
        name: t.communityName,
        tagline: t.tagline,
        location: t.location,
        productSummary: t.productSummary,
        disclaimer: t.disclaimer,
        theme: t.theme,
        published: true,
        updatedAt: new Date(),
      },
    })
    .returning();

  // Clear child rows for idempotent re-seed of plans/models/designs
  const existingLevels = await db
    .select({ id: planLevels.id })
    .from(planLevels)
    .where(eq(planLevels.projectId, project.id));
  for (const level of existingLevels) {
    await db.delete(planHotspots).where(eq(planHotspots.planLevelId, level.id));
  }
  await db.delete(planLevels).where(eq(planLevels.projectId, project.id));
  await db.delete(designs3d).where(eq(designs3d.projectId, project.id));
  await db.delete(homeModels).where(eq(homeModels.projectId, project.id));
  await db
    .delete(projectDocuments)
    .where(eq(projectDocuments.projectId, project.id));

  console.log("Seeding home models…");
  const modelRows = await db
    .insert(homeModels)
    .values(
      t.models.map((m, i) => ({
        projectId: project.id,
        code: m.code,
        name: m.name,
        elevation: m.elevation,
        sqft: m.sqft,
        planLabel: m.plan,
        priceCents: dollarsToCents(m.price),
        pricingAfterRebateCents: dollarsToCents(m.pricingAfterRebate),
        beds: m.beds,
        baths: m.baths,
        sortOrder: i,
      })),
    )
    .returning();

  const modelByCode = new Map(modelRows.map((m) => [m.code, m]));

  console.log("Seeding 3D designs…");
  const designRows = await db
    .insert(designs3d)
    .values(
      t.assets.map((a) => {
        const model = a.modelCode ? modelByCode.get(a.modelCode) : undefined;
        return {
          projectId: project.id,
          modelId: model?.id ?? null,
          kind: a.kind === "site" ? ("site" as const) : a.kind,
          sceneKey: a.id,
          label: a.label,
          src: a.src,
          format: a.format ?? "glb",
          ready: a.ready,
          notes: a.notes,
        };
      }),
    )
    .returning();

  const designByScene = new Map(designRows.map((d) => [d.sceneKey, d]));

  // Ensure room scene designs exist for hotspot linking (placeholders)
  const roomSceneKeys = new Set<string>();
  for (const level of t.floorPlans) {
    for (const h of level.hotspots) {
      if (h.sceneId) roomSceneKeys.add(h.sceneId);
    }
  }
  const missingRooms = [...roomSceneKeys].filter((k) => !designByScene.has(k));
  if (missingRooms.length) {
    const roomDesigns = await db
      .insert(designs3d)
      .values(
        missingRooms.map((sceneKey) => ({
          projectId: project.id,
          modelId: null,
          kind: "room" as const,
          sceneKey,
          label: sceneKey.replace(/^room-/, "").replace(/-/g, " "),
          src: `/tenants/${t.slug}/assets/interiors/${sceneKey}.glb`,
          format: "glb",
          ready: false,
          notes: "Placeholder room scene — link from plan hotspot",
        })),
      )
      .returning();
    for (const d of roomDesigns) designByScene.set(d.sceneKey, d);
  }

  console.log("Seeding plan levels + hotspots…");
  for (const [i, level] of t.floorPlans.entries()) {
    const [planLevel] = await db
      .insert(planLevels)
      .values({
        projectId: project.id,
        modelId: null,
        slug: level.id,
        label: level.label,
        imageSrc: level.imageSrc,
        description: level.description,
        sortOrder: i,
      })
      .returning();

    if (level.hotspots.length) {
      await db.insert(planHotspots).values(
        level.hotspots.map((h) => {
          const design = h.sceneId ? designByScene.get(h.sceneId) : undefined;
          return {
            planLevelId: planLevel.id,
            slug: h.id,
            label: h.label,
            x: String(h.x),
            y: String(h.y),
            w: String(h.w),
            h: String(h.h),
            dims: h.dims,
            notes: h.notes,
            sceneKey: h.sceneId,
            design3dId: design?.id ?? null,
          };
        }),
      );
    }
  }

  if (t.documents.length) {
    await db.insert(projectDocuments).values(
      t.documents.map((d, i) => ({
        projectId: project.id,
        label: d.label,
        href: d.href,
        sortOrder: i,
      })),
    );
  }

  console.log("Done.");
  console.log(`  partner: ${partner.slug}`);
  console.log(`  project: ${project.slug}`);
  console.log(`  models:  ${modelRows.length}`);
  console.log(`  designs: ${designByScene.size}`);
  console.log(`  plans:   ${t.floorPlans.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
