# Virtual Sales Office

Multi-tenant virtual sales office for homebuilders.

**First tenant:** [Smart Castle Homes](https://smartcastlehomes.com/) · Cedar Hedge (Milton)  
**Remote:** https://github.com/tanveerafzal/virtual-sales-office.git

## Stack

- **Next.js** (App Router) + TypeScript
- **Three.js** via React Three Fiber + Drei
- **GSAP** for UI motion
- **Neon Postgres** + Drizzle ORM (partners → projects → models → plans / 3D)
- Static fallback under `src/tenants/` when `DATABASE_URL` is unset
- Tailwind CSS + per-tenant CSS variables

## Database

See [docs/DATA-MODEL.md](docs/DATA-MODEL.md).

```bash
# .env.local
DATABASE_URL=postgresql://...

npm run db:push
npm run db:seed
```

## Run

```bash
npm install
npm run dev
```

- Platform: http://localhost:3000  
- Cedar Hedge: http://localhost:3000/t/cedar-hedge  
- 3D explore: http://localhost:3000/t/cedar-hedge/explore  

## 3D content (human team)

Exterior elevations and interior layouts are produced outside this repo’s “placeholder” geometry. Drop GLBs under:

```
public/tenants/cedar-hedge/assets/exteriors/
public/tenants/cedar-hedge/assets/interiors/
```

Then set `ready: true` on the matching asset in `src/tenants/cedar-hedge/config.ts`. See [docs/ASSETS.md](docs/ASSETS.md) and the folder README.

## Add another builder client

1. Copy `src/tenants/cedar-hedge/` → `src/tenants/<slug>/`
2. Fill brand, models, asset slots (no Smart Castle leakage in shared UI)
3. Register in `src/tenants/registry.ts`
4. Add `public/tenants/<slug>/assets/…`
