import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ModelGrid } from "@/components/tenant/ModelGrid";
import { getProjectAsTenant } from "@/lib/data/get-project";

export async function generateMetadata({
  params,
}: PageProps<"/t/[tenant]/models">): Promise<Metadata> {
  const { tenant: slug } = await params;
  const tenant = await getProjectAsTenant(slug);
  if (!tenant) return {};
  return { title: `Models · ${tenant.communityName}` };
}

export default async function ModelsPage({
  params,
}: PageProps<"/t/[tenant]/models">) {
  const { tenant: slug } = await params;
  const tenant = await getProjectAsTenant(slug);
  if (!tenant) notFound();

  return <ModelGrid tenant={tenant} />;
}
