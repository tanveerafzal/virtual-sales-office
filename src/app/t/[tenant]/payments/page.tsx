import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InstallmentCalculator } from "@/components/payments/InstallmentCalculator";
import { getProjectAsTenant } from "@/lib/data/get-project";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenant: string }>;
}): Promise<Metadata> {
  const { tenant: slug } = await params;
  const tenant = await getProjectAsTenant(slug);
  if (!tenant) return {};
  return {
    title: `Installment calculator · ${tenant.communityName}`,
    description: `Estimate monthly installments and the total paid for a ${tenant.communityName} home.`,
  };
}

export default async function PaymentsPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: slug } = await params;
  const tenant = await getProjectAsTenant(slug);
  if (!tenant) notFound();
  return <InstallmentCalculator tenant={tenant} />;
}
