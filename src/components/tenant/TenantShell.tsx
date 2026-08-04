import Link from "next/link";
import type { TenantConfig } from "@/tenants/types";

type Props = {
  tenant: TenantConfig;
  children: React.ReactNode;
};

export function TenantShell({ tenant, children }: Props) {
  const base = `/t/${tenant.slug}`;
  const t = tenant.theme;

  return (
    <div
      className="tenant-shell flex min-h-full flex-1 flex-col"
      style={
        {
          "--t-bg": t.background,
          "--t-fg": t.foreground,
          "--t-muted": t.muted,
          "--t-accent": t.accent,
          "--t-accent-soft": t.accentSoft,
          "--t-gold": t.gold,
          "--t-surface": t.surface,
          "--t-grad-from": t.gradientFrom,
          "--t-grad-to": t.gradientTo,
          background: `linear-gradient(165deg, ${t.gradientFrom} 0%, ${t.gradientTo} 55%, ${t.background} 100%)`,
          color: t.foreground,
        } as React.CSSProperties
      }
    >
      <header className="relative z-20 flex items-center justify-between gap-6 px-6 py-5 md:px-10">
        <Link href={base} className="group min-w-0">
          <p className="font-[family-name:var(--font-display)] text-xl leading-snug tracking-tight text-[var(--t-fg)] md:text-2xl">
            {tenant.builderName}
          </p>
          <p className="mt-1 truncate text-xs uppercase leading-normal tracking-[0.22em] text-[var(--t-gold)]">
            {tenant.communityName}
          </p>
        </Link>
        <nav className="flex shrink-0 items-center gap-1 text-sm text-[var(--t-muted)] md:gap-2">
          <Link
            href={`${base}/models`}
            className="rounded-sm px-3 py-2 transition-colors hover:text-[var(--t-fg)]"
          >
            Models
          </Link>
          <Link
            href={`${base}/plans`}
            className="rounded-sm px-3 py-2 transition-colors hover:text-[var(--t-fg)]"
          >
            Plans
          </Link>
          <Link
            href={`${base}/explore`}
            className="rounded-sm px-3 py-2 transition-colors hover:text-[var(--t-fg)]"
          >
            Explore 3D
          </Link>
          <a
            href={`mailto:${tenant.contact.email}?subject=${encodeURIComponent(
              `${tenant.communityName} inquiry`,
            )}`}
            className="ml-1 rounded-sm bg-[var(--t-accent)] px-3 py-2 text-[var(--t-fg)] transition-colors hover:bg-[var(--t-accent-soft)]"
          >
            Inquire
          </a>
        </nav>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
      <footer className="border-t border-white/10 px-6 py-8 text-xs leading-relaxed text-[var(--t-muted)] md:px-10">
        <p className="max-w-3xl">{tenant.disclaimer}</p>
        <p className="mt-3">
          {tenant.contact.phone.join(" · ")} ·{" "}
          <a className="underline decoration-white/20 underline-offset-2" href={`mailto:${tenant.contact.email}`}>
            {tenant.contact.email}
          </a>
        </p>
      </footer>
    </div>
  );
}
