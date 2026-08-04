"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { TenantConfig } from "@/tenants/types";

type Props = {
  tenant: TenantConfig;
};

export function CommunityHero({ tenant }: Props) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-brand", {
        y: 28,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
      });
      gsap.from(".hero-line", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        delay: 0.15,
        stagger: 0.08,
        ease: "power3.out",
      });
      gsap.from(".hero-cta", {
        y: 16,
        opacity: 0,
        duration: 0.7,
        delay: 0.4,
        ease: "power3.out",
      });
      gsap.to(".hero-glow", {
        opacity: 0.55,
        duration: 2.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const base = `/t/${tenant.slug}`;

  return (
    <section
      ref={root}
      className="relative flex min-h-[calc(100svh-5.5rem)] flex-col justify-end overflow-hidden px-6 pb-16 pt-10 md:px-10 md:pb-20"
    >
      <div
        aria-hidden
        className="hero-glow pointer-events-none absolute inset-0 opacity-35"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 70% 40%, var(--t-accent) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 20% 80%, var(--t-gold) 0%, transparent 55%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 max-w-4xl">
        <p className="hero-brand font-[family-name:var(--font-display)] text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.95] tracking-tight text-[var(--t-fg)]">
          {tenant.builderName}
        </p>
        <p className="hero-line mt-3 font-[family-name:var(--font-display)] text-[clamp(1.5rem,4vw,2.25rem)] text-[var(--t-gold)]">
          {tenant.communityName}
        </p>
        <p className="hero-line mt-5 max-w-xl text-base text-[var(--t-muted)] md:text-lg">
          {tenant.tagline} {tenant.location}.
        </p>
        <div className="hero-cta mt-10 flex flex-wrap gap-3">
          <Link
            href={`${base}/explore`}
            className="bg-[var(--t-fg)] px-6 py-3 text-sm font-medium text-[var(--t-bg)] transition-opacity hover:opacity-90"
          >
            Explore 3D
          </Link>
          <Link
            href={`${base}/models`}
            className="border border-white/25 px-6 py-3 text-sm text-[var(--t-fg)] transition-colors hover:border-[var(--t-gold)] hover:text-[var(--t-gold)]"
          >
            View models
          </Link>
        </div>
      </div>
    </section>
  );
}
