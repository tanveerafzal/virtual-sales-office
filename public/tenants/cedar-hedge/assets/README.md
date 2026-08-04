# Cedar Hedge — 3D asset drop zone

Human artists own exterior elevations and interior layouts. Software loads whatever is registered in `src/tenants/cedar-hedge/config.ts`.

## Folders

| Path | Purpose |
|------|---------|
| `exteriors/` | Elevation / home exterior GLBs (`athabasca.glb`, `carleton.glb`, `dalhousie.glb`, `brock.glb`) |
| `interiors/` | Interior layout GLBs (same base names) |
| `site/` | Optional community / site context (`cedar-hedge-site.glb`) |

## Checklist when delivering a model

1. Export **glTF/GLB**, Y-up, meters, origin at ground center.
2. Compress (DRACO or meshopt) if large; keep mobile-friendly.
3. Place file in the matching folder above.
4. In `src/tenants/cedar-hedge/config.ts`, set that asset’s `ready: true`.
5. Verify at `/t/cedar-hedge/explore` (orbit + switch Exterior / Interior).

Until `ready: true`, the explore canvas shows an explicit placeholder so slots are never mistaken for final art.
