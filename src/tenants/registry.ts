import { cedarHedgeTenant } from "./cedar-hedge/config";
import type { TenantConfig } from "./types";

const tenants: Record<string, TenantConfig> = {
  [cedarHedgeTenant.slug]: cedarHedgeTenant,
};

export function listTenants(): TenantConfig[] {
  return Object.values(tenants);
}

export function getTenant(slug: string): TenantConfig | undefined {
  return tenants[slug];
}

export function requireTenant(slug: string): TenantConfig {
  const tenant = getTenant(slug);
  if (!tenant) {
    throw new Error(`Unknown tenant: ${slug}`);
  }
  return tenant;
}
