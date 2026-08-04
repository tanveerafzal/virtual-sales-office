import Link from "next/link";
import { listTenants } from "@/tenants/registry";

export default function Home() {
  const tenants = listTenants();

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden bg-[#0e1518] text-[#f2efe8]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 60% 0%, #4a737e 0%, transparent 55%), linear-gradient(180deg, #0e1518 0%, #162024 100%)",
        }}
      />
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-20 md:px-10">
        <p className="text-xs uppercase tracking-[0.28em] text-[#c5a46a]">
          Virtual Sales Office
        </p>
        <h1 className="mt-4 max-w-2xl font-[family-name:var(--font-display)] text-[clamp(2.5rem,7vw,4.5rem)] leading-[0.98] tracking-tight">
          Configurable sales galleries for homebuilders
        </h1>
        <p className="mt-5 max-w-xl text-lg text-[#9aadaf]">
          Multi-tenant product shell. First community: Smart Castle Homes · Cedar
          Hedge. 3D exteriors and interiors are delivered by your design team as
          GLBs.
        </p>

        <ul className="mt-12 space-y-4">
          {tenants.map((t) => (
            <li key={t.slug}>
              <Link
                href={`/t/${t.slug}`}
                className="group flex flex-col border-t border-white/15 pt-4 transition-colors sm:flex-row sm:items-baseline sm:justify-between"
              >
                <span className="font-[family-name:var(--font-display)] text-2xl group-hover:text-[#c5a46a]">
                  {t.builderName}
                </span>
                <span className="text-sm text-[#9aadaf]">
                  {t.communityName} · {t.location}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
