/**
 * Numeric package price in Algerian dinar (same integer field as `priceMad` in CMS/DB).
 * Use `formatDzd` from `@/lib/format-money` for all user-visible amounts.
 */
export function getPackagePriceMad(pkg) {
  if (!pkg) return 0;
  const pm = Number(pkg.priceMad);
  if (Number.isFinite(pm) && pm >= 0) return Math.round(pm);
  if (pkg.priceType === "paid" || pkg.priceType === "premium") return 299;
  return 0;
}
