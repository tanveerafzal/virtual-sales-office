# Cedar Hedge — front elevation sources for 3D

Source folder (ops repo, not committed here):

`/Users/tanverafzal/development/smartcastle-homes/assets/renderings/`

These are **marketing renderings** (artist’s concept), not construction drawings. Use for exterior GLB look-dev; confirm materials/dims with Jeffries plans if fidelity matters.

## Primary front elevations (GLB references)

| Elevation | Best front plate | Extra views | Notes |
|-----------|------------------|-------------|-------|
| Athabasca | `Athabasca-elev.jpg`, `Athabasca.jpg` | `Athabasca-2.jpg`, `Athabasca-3.jpg`, `Athabasca-hero.jpg` | Light stone left + white entry/balcony right; dual garage; black frames |
| Carleton | `Carleton.jpg` | `Carleton-2.jpg`, `Carleton-3.jpg`, `Carleton-angle1.jpg`, `Carleton-angle2.jpg` | Light grey stone + charcoal brick recess; columned portico; glass balcony |
| Dalhousie | `Dalhousie.jpg` | `Dalhousie-2.jpg`, `Dalhousie-3.jpg`, `Dalhousie-angle1.jpg`, `Dalhousie-angle2.jpg` | Dark grey stone left + light stucco entry; white fascia; dual garage w/ side lites |
| Brock | `Brock.jpg` | `Brock-2.jpg`, `Brock-3.jpg` | Dark brick base, charcoal massing, wood-slat accents, white left quoin strip |

`Ryerson*.jpg` files match Brock sizing/content (legacy name) — prefer **Brock** for product naming.

`web-*.jpg` = web-optimized duplicates of the same elevations.

## Shared massing (all four)

- Narrow 36′ frontage, 3 visual tiers (garage / main / upper)
- Low hip roof, dark shingles
- Raised front entry (≈5–6 steps) with black railings
- Double garage at grade
- Black window/door frames

## Target GLB slots

```
public/tenants/cedar-hedge/assets/exteriors/
  athabasca.glb
  carleton.glb
  dalhousie.glb
  brock.glb
```

Then set `ready: true` on matching assets in `src/tenants/cedar-hedge/config.ts`.
