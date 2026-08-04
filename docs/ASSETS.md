# 3D asset pipeline

Humans produce exterior elevations and interior layouts. The app only wires slots.

## Conventions

- Format: `.glb` preferred (embedded buffers)
- Orientation: Y-up, meters
- Origin: ground center of the home
- Naming: `{elevation-slug}.glb` under `exteriors/` or `interiors/`
- Register in tenant `assets[]` with matching `src` and flip `ready` when live

## Local paths

```
public/tenants/<tenantSlug>/assets/
  exteriors/
  interiors/
  site/
```

## Later (CDN)

Large GLBs should move to object storage / CDN; keep `src` as absolute URL in tenant config without changing the React scene API.
