import { notFound } from "next/navigation";
import { TenantShell } from "@/components/tenant/TenantShell";
import { getTenant, listTenants } from "@/tenants/registry";

export function generateStaticParams() {
  return listTenants().map((t) => ({ tenant: t.slug }));
}

export default async function TenantLayout({
  children,
  params,
}: LayoutProps<"/t/[tenant]">) {
  const { tenant: slug } = await params;
  const tenant = getTenant(slug);
  if (!tenant) notFound();

  return <TenantShell tenant={tenant}>{children}</TenantShell>;
}
