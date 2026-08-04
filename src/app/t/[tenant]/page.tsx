import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CommunityHero } from "@/components/tenant/CommunityHero";
import { ModelGrid } from "@/components/tenant/ModelGrid";
import { getTenant } from "@/tenants/registry";

export async function generateMetadata({
  params,
}: PageProps<"/t/[tenant]">): Promise<Metadata> {
  const { tenant: slug } = await params;
  const tenant = getTenant(slug);
  if (!tenant) return {};
  return {
    title: `${tenant.builderName} · ${tenant.communityName}`,
    description: tenant.tagline,
  };
}

export default async function TenantHomePage({
  params,
}: PageProps<"/t/[tenant]">) {
  const { tenant: slug } = await params;
  const tenant = getTenant(slug);
  if (!tenant) notFound();

  return (
    <>
      <CommunityHero tenant={tenant} />
      <ModelGrid tenant={tenant} />
    </>
  );
}
