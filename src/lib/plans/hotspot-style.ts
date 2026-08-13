import type { FloorHotspot, FloorPlanLevel, PercentBox } from "@/tenants/types";

/** Map a hotspot (relative to contentBox) into % of the full plan image. */
export function hotspotImageBox(
  level: FloorPlanLevel,
  hotspot: FloorHotspot,
): PercentBox {
  const box = level.contentBox;
  if (!box) {
    return { x: hotspot.x, y: hotspot.y, w: hotspot.w, h: hotspot.h };
  }
  return {
    x: box.x + (hotspot.x / 100) * box.w,
    y: box.y + (hotspot.y / 100) * box.h,
    w: (hotspot.w / 100) * box.w,
    h: (hotspot.h / 100) * box.h,
  };
}
