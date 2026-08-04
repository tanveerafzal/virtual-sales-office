import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ModelGrid } from "@/components/tenant/ModelGrid";
import { getTenant } from "@/tenants/registry";

export async function generateMetadata({
  params,
}: PageProps<"/t/[tenant]/models">): Promise<Metadata> {
  const { tenant: slug } = await params;
  const tenant = getTenant(slug);
  if (!tenant) return {};
  return { title: `Models · ${tenant.communityName}` };
}

export default async function ModelsPage({
  params,
}: PageProps<"/t/[tenant]/models">) {
  const { tenant: slug } = await params;
  const tenant = getTenant(slug);
  if (!tenant) notFound();

  return <ModelGrid tenant={tenant} />;
}
