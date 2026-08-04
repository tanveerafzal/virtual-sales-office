import { notFound } from "next/navigation";
import { TenantShell } from "@/components/tenant/TenantShell";
import {
  getProjectAsTenant,
  listProjectSlugs,
} from "@/lib/data/get-project";

export async function generateStaticParams() {
  const slugs = await listProjectSlugs();
  return slugs.map((tenant) => ({ tenant }));
}

export default async function TenantLayout({
  children,
  params,
}: LayoutProps<"/t/[tenant]">) {
  const { tenant: slug } = await params;
  const tenant = await getProjectAsTenant(slug);
  if (!tenant) notFound();

  return <TenantShell tenant={tenant}>{children}</TenantShell>;
}
