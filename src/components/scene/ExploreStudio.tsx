"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExploreCanvas } from "@/components/scene/ExploreCanvas";
import type { AssetKind, TenantConfig } from "@/tenants/types";

type Props = {
  tenant: TenantConfig;
  initialModelCode?: string;
  initialView?: AssetKind;
};

export function ExploreStudio({
  tenant,
  initialModelCode,
  initialView = "exterior",
}: Props) {
  const elevations = useMemo(() => {
    const map = new Map<string, { elevation: string; code: string }>();
    for (const m of tenant.models) {
      if (!map.has(m.elevation)) {
        map.set(m.elevation, { elevation: m.elevation, code: m.code });
      }
    }
    return [...map.values()];
  }, [tenant.models]);

  const [modelCode, setModelCode] = useState(
    initialModelCode && tenant.models.some((m) => m.code === initialModelCode)
      ? initialModelCode
      : elevations[0]?.code ?? tenant.models[0]?.code,
  );
  const [view, setView] = useState<AssetKind>(
    initialView === "interior" ? "interior" : "exterior",
  );

  const model = tenant.models.find((m) => m.code === modelCode) ?? tenant.models[0];
  const assetId =
    view === "interior" ? model?.interiorAssetId : model?.exteriorAssetId;
  const asset = tenant.assets.find((a) => a.id === assetId);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-wrap items-end justify-between gap-4 px-6 pb-4 pt-2 md:px-10">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight md:text-4xl">
            Explore 3D
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--t-muted)]">
            Orbit placeholders until elevation and interior GLBs are delivered.
            Drop files under{" "}
            <code className="text-[var(--t-gold)]">
              public/tenants/{tenant.slug}/assets/
            </code>{" "}
            and set <code className="text-[var(--t-gold)]">ready: true</code> in
            tenant config.
          </p>
        </div>
        <Link
          href={`/t/${tenant.slug}/models`}
          className="text-sm text-[var(--t-accent-soft)] underline decoration-white/15 underline-offset-4"
        >
          Back to models
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 px-6 pb-4 md:px-10">
        {elevations.map((e) => (
          <button
            key={e.elevation}
            type="button"
            onClick={() => setModelCode(e.code)}
            className={`px-3 py-2 text-sm transition-colors ${
              model?.elevation === e.elevation
                ? "bg-[var(--t-accent)] text-[var(--t-fg)]"
                : "border border-white/15 text-[var(--t-muted)] hover:border-white/35 hover:text-[var(--t-fg)]"
            }`}
          >
            {e.elevation}
          </button>
        ))}
        <div className="mx-2 hidden h-8 w-px bg-white/15 sm:block" />
        {(["exterior", "interior"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`px-3 py-2 text-sm capitalize transition-colors ${
              view === v
                ? "bg-[var(--t-gold)] text-[var(--t-bg)]"
                : "border border-white/15 text-[var(--t-muted)] hover:border-white/35 hover:text-[var(--t-fg)]"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      <ExploreCanvas
        tenant={tenant}
        asset={asset}
        viewLabel={`${model?.name ?? "Model"} · ${view}`}
      />

      <ul className="grid gap-3 px-6 py-8 text-sm text-[var(--t-muted)] md:grid-cols-2 md:px-10">
        {tenant.assets
          .filter((a) => a.kind === "exterior" || a.kind === "interior")
          .map((a) => (
            <li
              key={a.id}
              className="flex items-start justify-between gap-3 border-t border-white/10 pt-3"
            >
              <span>
                <span className="text-[var(--t-fg)]">{a.label}</span>
                <br />
                <span className="text-xs">{a.src}</span>
              </span>
              <span
                className={`shrink-0 text-[10px] uppercase tracking-[0.16em] ${
                  a.ready ? "text-[var(--t-accent-soft)]" : "text-[var(--t-gold)]"
                }`}
              >
                {a.ready ? "Ready" : "Pending"}
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
}
