/** Mask an email for on-video watermark without storing secrets. */
export function maskEmailForWatermark(email: string): string {
  const raw = String(email || "").trim().toLowerCase();
  const at = raw.indexOf("@");
  if (at <= 0 || at === raw.length - 1) return "حساب محمي";
  const local = raw.slice(0, at);
  const domain = raw.slice(at + 1);
  const visible = local.slice(0, 1);
  return `${visible}***@${domain}`;
}

/** Short account reference — not a credential. */
export function accountRefForWatermark(userId: string): string {
  const id = String(userId || "").trim();
  if (id.length <= 6) return id || "—";
  return id.slice(-6);
}
