/**
 * Algerian dinar (DZD) display helpers.
 * Numeric amounts in the database/API stay unchanged; only user-facing strings use "دج".
 */

export const DZD_SUFFIX = "دج";

/**
 * @param {number|string|null|undefined} amount
 * @param {{ group?: boolean }} [options] - `group: false` for plain digits (e.g. 2500 دج); default groups thousands (2,500 دج).
 */
export function formatDzd(amount, options) {
  const group = options?.group !== false;
  const raw = typeof amount === "string" ? Number(String(amount).replace(/[\s,]/g, "")) : Number(amount);
  if (!Number.isFinite(raw)) {
    return group ? `0 ${DZD_SUFFIX}` : `0 ${DZD_SUFFIX}`;
  }
  const rounded = Math.round(raw);
  const num = group
    ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(rounded)
    : String(rounded);
  return `${num} ${DZD_SUFFIX}`;
}

/**
 * @param {number|string|null|undefined} amount
 */
export function formatDzdSigned(amount, options) {
  const raw = typeof amount === "string" ? Number(String(amount).replace(/[\s,]/g, "")) : Number(amount);
  if (!Number.isFinite(raw) || raw === 0) return formatDzd(0, options);
  const sign = raw > 0 ? "+" : "−";
  const abs = Math.abs(Math.round(raw));
  const group = options?.group !== false;
  const num = group
    ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(abs)
    : String(abs);
  return `${sign}${num} ${DZD_SUFFIX}`;
}

/**
 * @param {number|string|null|undefined} amount
 */
export function formatDzdOrDash(amount, options) {
  if (amount === null || amount === undefined || amount === "") return "—";
  return formatDzd(amount, options);
}
