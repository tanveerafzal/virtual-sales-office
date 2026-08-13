"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import gsap from "gsap";
import { hotspotImageBox } from "@/lib/plans/hotspot-style";
import type { FloorHotspot, FloorPlanLevel, TenantConfig } from "@/tenants/types";

type Props = {
  tenant: TenantConfig;
  initialLevelId?: string;
  initialHotspotId?: string;
};

export function FloorPlanViewer({
  tenant,
  initialLevelId,
  initialHotspotId,
}: Props) {
  const levels = tenant.floorPlans;
  const [levelId, setLevelId] = useState(
    initialLevelId && levels.some((l) => l.id === initialLevelId)
      ? initialLevelId
      : levels[0]?.id,
  );
  const [selectedId, setSelectedId] = useState<string | undefined>(
    initialHotspotId,
  );
  const [hoveredId, setHoveredId] = useState<string | undefined>();

  const level: FloorPlanLevel | undefined = useMemo(
    () => levels.find((l) => l.id === levelId) ?? levels[0],
    [levels, levelId],
  );

  const selected: FloorHotspot | undefined = level?.hotspots.find(
    (h) => h.id === selectedId,
  );

  useEffect(() => {
    if (!selectedId) return;
    const el = document.querySelector("[data-room-panel]");
    if (!el) return;
    gsap.fromTo(
      el,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" },
    );
  }, [selectedId, levelId]);

  if (!levels.length || !level) {
    return (
      <p className="px-6 py-16 text-[var(--t-muted)] md:px-10">
        No floor plans configured for this tenant yet.
      </p>
    );
  }

  const exploreHref = selected?.sceneId
    ? `/t/${tenant.slug}/explore?view=interior&scene=${encodeURIComponent(selected.sceneId)}`
    : `/t/${tenant.slug}/explore?view=interior`;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-wrap items-end justify-between gap-4 px-6 pb-4 pt-2 md:px-10">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl leading-snug tracking-tight md:text-4xl">
            Interior plans
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--t-muted)]">
            Click a room on the 2D plan. 3D interiors hook up later via each
            room’s <code className="text-[var(--t-gold)]">sceneId</code>.
          </p>
        </div>
        <Link
          href={`/t/${tenant.slug}/explore`}
          className="text-sm text-[var(--t-accent-soft)] underline decoration-white/15 underline-offset-4"
        >
          Exterior 3D
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 px-6 pb-4 md:px-10">
        {levels.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => {
              setLevelId(l.id);
              setSelectedId(undefined);
            }}
            className={`px-3 py-2 text-sm transition-colors ${
              level.id === l.id
                ? "bg-[var(--t-accent)] text-[var(--t-fg)]"
                : "border border-white/15 text-[var(--t-muted)] hover:border-white/35 hover:text-[var(--t-fg)]"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="grid flex-1 gap-6 px-6 pb-12 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start md:px-10">
        <div className="relative w-full overflow-hidden border border-white/10 bg-[#f4f1ea]">
          <div className="relative mx-auto w-full max-w-3xl">
            <Image
              src={level.imageSrc}
              alt={level.label}
              width={900}
              height={1200}
              className="h-auto w-full select-none"
              priority
            />
            <div className="absolute inset-0 overflow-hidden">
              {level.hotspots.map((h) => {
                const box = hotspotImageBox(level, h);
                const active = selectedId === h.id || hoveredId === h.id;
                return (
                  <button
                    key={h.id}
                    type="button"
                    title={h.label}
                    aria-label={h.label}
                    aria-pressed={selectedId === h.id}
                    onMouseEnter={() => setHoveredId(h.id)}
                    onMouseLeave={() => setHoveredId(undefined)}
                    onFocus={() => setHoveredId(h.id)}
                    onBlur={() => setHoveredId(undefined)}
                    onClick={() => setSelectedId(h.id)}
                    className="absolute border transition-[background,border-color,box-shadow] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--t-gold)]"
                    style={{
                      left: `${box.x}%`,
                      top: `${box.y}%`,
                      width: `${box.w}%`,
                      height: `${box.h}%`,
                      background: active
                        ? "color-mix(in oklab, #4a737e 35%, transparent)"
                        : "transparent",
                      borderColor: active
                        ? "color-mix(in oklab, #c5a46a 85%, white)"
                        : "transparent",
                      boxShadow: active
                        ? "inset 0 0 0 1px rgba(197,164,106,0.5)"
                        : undefined,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <aside className="border border-white/10 bg-[var(--t-surface)]/80 p-5 backdrop-blur-sm lg:sticky lg:top-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--t-gold)]">
            {level.label}
          </p>
          {level.description && (
            <p className="mt-2 text-sm leading-relaxed text-[var(--t-muted)]">
              {level.description}
            </p>
          )}

          {selected ? (
            <div data-room-panel className="mt-6 border-t border-white/10 pt-5">
              <h2 className="font-[family-name:var(--font-display)] text-2xl leading-snug text-[var(--t-fg)]">
                {selected.label}
              </h2>
              {selected.dims && (
                <p className="mt-2 text-sm text-[var(--t-accent-soft)]">
                  {selected.dims}
                </p>
              )}
              {selected.notes && (
                <p className="mt-2 text-xs leading-relaxed text-[var(--t-muted)]">
                  {selected.notes}
                </p>
              )}
              <p className="mt-4 text-xs leading-relaxed text-[var(--t-muted)]">
                3D for this room is not hooked up yet
                {selected.sceneId ? (
                  <>
                    {" "}
                    (<code className="text-[var(--t-gold)]">
                      {selected.sceneId}
                    </code>
                    ).
                  </>
                ) : (
                  "."
                )}
              </p>
              <Link
                href={exploreHref}
                className="mt-5 inline-flex border border-white/20 px-4 py-2.5 text-sm text-[var(--t-fg)] transition-colors hover:border-[var(--t-gold)] hover:text-[var(--t-gold)]"
              >
                Open 3D slot
              </Link>
            </div>
          ) : (
            <p className="mt-6 border-t border-white/10 pt-5 text-sm leading-relaxed text-[var(--t-muted)]">
              Select a highlighted room on the plan to inspect it. Hover to
              preview zones.
            </p>
          )}

          <ul className="mt-6 max-h-64 space-y-1 overflow-y-auto border-t border-white/10 pt-4 text-sm">
            {level.hotspots.map((h) => (
              <li key={h.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(h.id)}
                  className={`w-full px-2 py-1.5 text-left transition-colors ${
                    selectedId === h.id
                      ? "bg-white/10 text-[var(--t-fg)]"
                      : "text-[var(--t-muted)] hover:text-[var(--t-fg)]"
                  }`}
                >
                  {h.label}
                  {h.dims ? (
                    <span className="ml-2 text-xs opacity-70">{h.dims}</span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
