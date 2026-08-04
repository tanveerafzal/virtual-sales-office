import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExploreStudio } from "@/components/scene/ExploreStudio";
import { getTenant } from "@/tenants/registry";
import type { AssetKind } from "@/tenants/types";

export async function generateMetadata({
  params,
}: PageProps<"/t/[tenant]/explore">): Promise<Metadata> {
  const { tenant: slug } = await params;
  const tenant = getTenant(slug);
  if (!tenant) return {};
  return { title: `Explore 3D · ${tenant.communityName}` };
}

export default async function ExplorePage({
  params,
  searchParams,
}: PageProps<"/t/[tenant]/explore">) {
  const { tenant: slug } = await params;
  const query = await searchParams;
  const tenant = getTenant(slug);
  if (!tenant) notFound();

  const model =
    typeof query.model === "string" ? query.model : undefined;
  const viewRaw = typeof query.view === "string" ? query.view : "exterior";
  const view: AssetKind =
    viewRaw === "interior" || viewRaw === "site" ? viewRaw : "exterior";

  return (
    <ExploreStudio
      tenant={tenant}
      initialModelCode={model}
      initialView={view}
    />
  );
}
