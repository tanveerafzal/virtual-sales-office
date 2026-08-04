import Link from "next/link";
import { formatCad } from "@/lib/format";
import type { TenantConfig } from "@/tenants/types";

type Props = {
  tenant: TenantConfig;
};

export function ModelGrid({ tenant }: Props) {
  const elevations = [...new Map(tenant.models.map((m) => [m.elevation, m])).values()];

  return (
    <section className="px-6 py-16 md:px-10 md:py-20">
      <div className="mb-10 max-w-2xl">
        <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight md:text-4xl">
          Models
        </h2>
        <p className="mt-3 text-[var(--t-muted)]">{tenant.productSummary}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {elevations.map((rep) => {
          const variants = tenant.models.filter((m) => m.elevation === rep.elevation);
          const exterior = tenant.assets.find((a) => a.id === rep.exteriorAssetId);
          return (
            <article
              key={rep.elevation}
              className="border-t border-white/15 pt-6"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-[family-name:var(--font-display)] text-2xl text-[var(--t-fg)]">
                  {rep.name}
                </h3>
                <span className="text-xs uppercase tracking-[0.18em] text-[var(--t-gold)]">
                  {rep.elevation}
                </span>
              </div>
              <ul className="mt-5 space-y-3 text-sm text-[var(--t-muted)]">
                {variants.map((v) => (
                  <li
                    key={v.code}
                    className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/5 pb-3"
                  >
                    <span>
                      <span className="text-[var(--t-fg)]">{v.code}</span>
                      {" · "}
                      {v.sqft} sq ft · {v.plan}
                    </span>
                    {v.price != null && (
                      <span className="text-[var(--t-fg)]">{formatCad(v.price)}</span>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
                <Link
                  href={`/t/${tenant.slug}/explore?model=${rep.code}&view=exterior`}
                  className="text-[var(--t-accent-soft)] underline decoration-white/15 underline-offset-4 hover:text-[var(--t-gold)]"
                >
                  {exterior?.ready ? "View exterior 3D" : "Exterior 3D slot"}
                </Link>
                {!exterior?.ready && (
                  <span className="text-xs text-[var(--t-muted)]">
                    Awaiting human GLB
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
