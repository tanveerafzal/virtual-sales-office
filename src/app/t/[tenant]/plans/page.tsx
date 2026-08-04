import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FloorPlanViewer } from "@/components/plans/FloorPlanViewer";
import { getTenant } from "@/tenants/registry";

export async function generateMetadata({
  params,
}: PageProps<"/t/[tenant]/plans">): Promise<Metadata> {
  const { tenant: slug } = await params;
  const tenant = getTenant(slug);
  if (!tenant) return {};
  return { title: `Interior plans · ${tenant.communityName}` };
}

export default async function PlansPage({
  params,
  searchParams,
}: PageProps<"/t/[tenant]/plans">) {
  const { tenant: slug } = await params;
  const query = await searchParams;
  const tenant = getTenant(slug);
  if (!tenant) notFound();

  const level =
    typeof query.level === "string" ? query.level : undefined;
  const room = typeof query.room === "string" ? query.room : undefined;

  return (
    <FloorPlanViewer
      tenant={tenant}
      initialLevelId={level}
      initialHotspotId={room}
    />
  );
}
