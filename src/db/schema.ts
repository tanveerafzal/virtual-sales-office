import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const designKindEnum = pgEnum("design_kind", [
  "exterior",
  "interior",
  "site",
  "room",
]);

export const lotStatusEnum = pgEnum("lot_status", [
  "available",
  "reserved",
  "sold",
  "tba",
]);

/** Builder / client organization */
export const partners = pgTable("partners", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  email: text("email"),
  phone: jsonb("phone").$type<string[]>().default([]),
  office: text("office"),
  website: text("website"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Community / development sold via VSO (URL: /t/[slug]) */
export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  partnerId: uuid("partner_id")
    .notNull()
    .references(() => partners.id, { onDelete: "cascade" }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull().default(""),
  location: text("location").notNull().default(""),
  productSummary: text("product_summary").notNull().default(""),
  disclaimer: text("disclaimer").notNull().default(""),
  theme: jsonb("theme").$type<Record<string, string>>().notNull(),
  /** Optional project-level contact override; else partner contact */
  contact: jsonb("contact").$type<{
    email?: string;
    phone?: string[];
    office?: string;
    website?: string;
  }>(),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Home model / elevation SKU within a project */
export const homeModels = pgTable(
  "home_models",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    elevation: text("elevation").notNull(),
    sqft: text("sqft").notNull().default(""),
    planLabel: text("plan_label").notNull().default(""),
    priceCents: integer("price_cents"),
    pricingAfterRebateCents: integer("pricing_after_rebate_cents"),
    beds: text("beds"),
    baths: text("baths"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("home_models_project_code").on(t.projectId, t.code)],
);

/**
 * 3D assets (GLB/etc). Linked to a model and/or hotspots on 2D plans.
 * kind=room is for per-room interiors keyed by sceneKey.
 */
export const designs3d = pgTable(
  "designs_3d",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    modelId: uuid("model_id").references(() => homeModels.id, {
      onDelete: "set null",
    }),
    kind: designKindEnum("kind").notNull(),
    /** Stable key for routing, e.g. room-kitchen, athabasca-exterior */
    sceneKey: text("scene_key").notNull(),
    label: text("label").notNull(),
    src: text("src").notNull(),
    format: text("format").notNull().default("glb"),
    ready: boolean("ready").notNull().default(false),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("designs_3d_project_scene").on(t.projectId, t.sceneKey),
  ],
);

/** 2D floor plan sheet (shared project-wide when modelId is null) */
export const planLevels = pgTable(
  "plan_levels",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    modelId: uuid("model_id").references(() => homeModels.id, {
      onDelete: "set null",
    }),
    slug: text("slug").notNull(),
    label: text("label").notNull(),
    imageSrc: text("image_src").notNull(),
    description: text("description"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [uniqueIndex("plan_levels_project_slug").on(t.projectId, t.slug)],
);

/**
 * Clickable room on a 2D plan.
 * design3dId links the hotspot → 3D drawing when available.
 */
export const planHotspots = pgTable("plan_hotspots", {
  id: uuid("id").defaultRandom().primaryKey(),
  planLevelId: uuid("plan_level_id")
    .notNull()
    .references(() => planLevels.id, { onDelete: "cascade" }),
  slug: text("slug").notNull(),
  label: text("label").notNull(),
  x: numeric("x", { precision: 6, scale: 2 }).notNull(),
  y: numeric("y", { precision: 6, scale: 2 }).notNull(),
  w: numeric("w", { precision: 6, scale: 2 }).notNull(),
  h: numeric("h", { precision: 6, scale: 2 }).notNull(),
  dims: text("dims"),
  notes: text("notes"),
  /** Route / lookup key before or alongside design3dId */
  sceneKey: text("scene_key"),
  design3dId: uuid("design_3d_id").references(() => designs3d.id, {
    onDelete: "set null",
  }),
});

export const projectDocuments = pgTable("project_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  href: text("href").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const lots = pgTable("lots", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  status: lotStatusEnum("status").notNull().default("tba"),
  x: numeric("x", { precision: 8, scale: 5 }),
  y: numeric("y", { precision: 8, scale: 5 }),
  premiumCents: integer("premium_cents"),
  modelId: uuid("model_id").references(() => homeModels.id, {
    onDelete: "set null",
  }),
});

export const partnersRelations = relations(partners, ({ many }) => ({
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  partner: one(partners, {
    fields: [projects.partnerId],
    references: [partners.id],
  }),
  models: many(homeModels),
  designs: many(designs3d),
  planLevels: many(planLevels),
  documents: many(projectDocuments),
  lots: many(lots),
}));

export const homeModelsRelations = relations(homeModels, ({ one, many }) => ({
  project: one(projects, {
    fields: [homeModels.projectId],
    references: [projects.id],
  }),
  designs: many(designs3d),
  planLevels: many(planLevels),
}));

export const designs3dRelations = relations(designs3d, ({ one, many }) => ({
  project: one(projects, {
    fields: [designs3d.projectId],
    references: [projects.id],
  }),
  model: one(homeModels, {
    fields: [designs3d.modelId],
    references: [homeModels.id],
  }),
  hotspots: many(planHotspots),
}));

export const planLevelsRelations = relations(planLevels, ({ one, many }) => ({
  project: one(projects, {
    fields: [planLevels.projectId],
    references: [projects.id],
  }),
  model: one(homeModels, {
    fields: [planLevels.modelId],
    references: [homeModels.id],
  }),
  hotspots: many(planHotspots),
}));

export const planHotspotsRelations = relations(planHotspots, ({ one }) => ({
  planLevel: one(planLevels, {
    fields: [planHotspots.planLevelId],
    references: [planLevels.id],
  }),
  design3d: one(designs3d, {
    fields: [planHotspots.design3dId],
    references: [designs3d.id],
  }),
}));
