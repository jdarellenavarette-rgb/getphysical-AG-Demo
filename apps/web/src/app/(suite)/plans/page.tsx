import { Tags } from "lucide-react";
import { calculateHybridServiceFee, describeProductLength, type FacilityProduct } from "sodia-core";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { EmptyState, Notice, PageHeader } from "../../../components/ui/states";
import { Table, Td, Th } from "../../../components/ui/table";
import { canManageFacility, requireSuiteSession } from "../../../lib/active-facility";
import { loadProducts, loadSellingSettings, type SellingSettings } from "../../../lib/data/products";
import { formatPeso } from "../../../lib/format";
import { ProductForm } from "./ProductForm";
import { ProductToggle } from "./ProductToggle";
import { SellingSettingsForm } from "./SellingSettingsForm";

export const metadata = { title: "Plans and prices" };

/** Whether members can buy it right now, and if not, why. */
function saleStatus(
  product: FacilityProduct,
  settings: SellingSettings,
): { label: string; tone: "success" | "neutral" | "warning" } {
  if (!product.is_active) return { label: "Off", tone: "neutral" };
  if (product.kind === "PASS" && !settings.sellsPasses) return { label: "Hidden: passes are off", tone: "warning" };
  if (product.kind === "MEMBERSHIP" && !settings.sellsMemberships) {
    return { label: "Hidden: memberships are off", tone: "warning" };
  }
  return { label: "On sale", tone: "success" };
}

export default async function PlansPage() {
  const { active } = await requireSuiteSession();
  const [products, settings] = await Promise.all([loadProducts(active.id), loadSellingSettings(active.id)]);
  const canEdit = canManageFacility(active.role);

  return (
    <>
      <PageHeader
        title="Plans and prices"
        description={`What ${active.name} sells in the Sodia app. You choose the names, prices and lengths.`}
      />
      {!canEdit && (
        <div className="mb-6">
          <Notice tone="warning" role="note">
            Only the owner or an admin can change plans and prices. You can view them here.
          </Notice>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="self-start">
          <CardHeader>
            <CardTitle>What you sell</CardTitle>
          </CardHeader>
          <CardContent>
            <SellingSettingsForm
              key={`${settings.sellsPasses}-${settings.sellsMemberships}-${settings.graceDays}`}
              settings={settings}
              canEdit={canEdit}
            />
          </CardContent>
        </Card>

        <div className="grid min-w-0 gap-6 xl:col-span-2">
          {canEdit && (
            <Card>
              <CardHeader>
                <CardTitle>Add a plan</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductForm />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Your plans</CardTitle>
              <span className="text-sm text-muted-foreground">
                The member pays your price plus the service fee. You receive your price.
              </span>
            </CardHeader>
            {products.length === 0 ? (
              <EmptyState
                icon={Tags}
                title="No plans yet"
                description="Add your first plan above, for example a day pass. Members can buy it in the Sodia app once it is on sale."
              />
            ) : (
              <div className="pt-3">
                <Table>
                  <thead>
                    <tr>
                      <Th>Plan</Th>
                      <Th>Length</Th>
                      <Th>Your price</Th>
                      <Th>Member pays</Th>
                      <Th>Status</Th>
                      {canEdit && (
                        <Th>
                          <span className="sr-only">Actions</span>
                        </Th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => {
                      const status = saleStatus(product, settings);
                      const fee = calculateHybridServiceFee(
                        product.price_php,
                        product.kind === "MEMBERSHIP" ? "recurring_subscription" : "one_time_pass",
                      );
                      return (
                        <tr key={product.id}>
                          <Td>
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-muted-foreground">
                              {product.kind === "MEMBERSHIP" ? "Membership" : "Pass"}
                              {product.description ? ` · ${product.description}` : ""}
                            </p>
                            {canEdit && (
                              <details className="mt-2">
                                <summary className="cursor-pointer text-sm font-semibold underline">Edit</summary>
                                <div className="mt-3 min-w-72">
                                  <ProductForm
                                    key={`${product.id}-${product.price_php}-${product.name}`}
                                    product={product}
                                  />
                                </div>
                              </details>
                            )}
                          </Td>
                          <Td>{describeProductLength(product.duration_days)}</Td>
                          <Td className="tabular-nums">{formatPeso(product.price_php)}</Td>
                          <Td className="tabular-nums">{formatPeso(fee.totalChargePhp)}</Td>
                          <Td>
                            <Badge tone={status.tone}>{status.label}</Badge>
                          </Td>
                          {canEdit && (
                            <Td className="text-right">
                              <ProductToggle
                                productId={product.id}
                                productName={product.name}
                                isActive={product.is_active}
                              />
                            </Td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
