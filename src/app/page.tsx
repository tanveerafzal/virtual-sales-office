import Link from "next/link";
import { listProjectsAsTenants } from "@/lib/data/get-project";

export default async function Home() {
  const tenants = await listProjectsAsTenants();

  return (
    <main className="relative flex flex-1 flex-col bg-[#0e1518] text-[#f2efe8]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 60% 0%, #4a737e 0%, transparent 55%), linear-gradient(180deg, #0e1518 0%, #162024 100%)",
        }}
      />
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-20 md:px-10">
        <p className="text-xs uppercase tracking-[0.28em] text-[#c5a46a]">
          Virtual Sales Office
        </p>
        <h1 className="mt-5 max-w-2xl font-[family-name:var(--font-display)] text-[clamp(2.5rem,7vw,4.5rem)] leading-[1.15] tracking-tight">
          Configurable sales galleries for homebuilders
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#9aadaf]">
          Partners publish projects with models, 2D plans, and 3D designs — data
          from Neon when configured.
        </p>

        <ul className="mt-12 space-y-4">
          {tenants.map((t) => (
            <li key={t.slug}>
              <Link
                href={`/t/${t.slug}`}
                className="group flex flex-col border-t border-white/15 pt-4 transition-colors sm:flex-row sm:items-baseline sm:justify-between"
              >
                <span className="font-[family-name:var(--font-display)] text-2xl leading-snug group-hover:text-[#c5a46a]">
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
