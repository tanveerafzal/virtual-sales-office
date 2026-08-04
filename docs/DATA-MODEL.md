# Virtual Sales Office — data model (Neon)

```
Partner (builder)
  └── Project (community)          → /t/[project.slug]
        ├── HomeModel              → elevation SKUs (36A Athabasca, …)
        ├── Design3D               → exterior / interior / site / room GLBs
        ├── PlanLevel              → 2D floor sheets (shared or per-model)
        │     └── PlanHotspot      → room zones
        │           └── design3dId → **link plan room ↔ 3D drawing**
        ├── Lot
        └── Document
```

## Linking plans ↔ 3D

| Link | How |
|------|-----|
| Model → exterior/interior GLB | `designs_3d.model_id` + `kind` |
| Plan room → 3D scene | `plan_hotspots.design_3d_id` (and/or `scene_key`) |
| Shared project plans | `plan_levels.model_id` is null |

UI still consumes a mapped `TenantConfig` via `getProjectAsTenant(slug)`.

## Setup

1. Create a Neon project and copy the connection string.
2. Add to `.env.local` and Vercel env:

```bash
DATABASE_URL=postgresql://...
```

3. Push schema + seed:

```bash
npm run db:push
npm run db:seed
```

Without `DATABASE_URL`, the app falls back to static `src/tenants/cedar-hedge` config.
