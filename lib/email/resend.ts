import { Resend } from "resend";
import { absoluteUrl } from "@/lib/site-config";

function getResendConfig(): { apiKey: string; from: string } | { error: string } {
  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  const from = String(process.env.RESEND_FROM_EMAIL || "").trim();
  if (!apiKey || !from) {
    return {
      error:
        "Missing RESEND_API_KEY or RESEND_FROM_EMAIL. Configure both environment variables to send password-reset emails.",
    };
  }
  return { apiKey, from };
}

/**
 * Send Arabic password-reset email via Resend.
 * Never logs the raw token. Returns ok:false on config/send failure.
 */
export async function sendPasswordResetEmail(params: {
  to: string;
  fullName: string;
  rawToken: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const config = getResendConfig();
  if ("error" in config) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[password-reset][email]", config.error);
    } else {
      console.error("[password-reset][email] Resend is not configured.");
    }
    return { ok: false, reason: "resend_not_configured" };
  }

  const resetUrl = absoluteUrl(`/reset-password?token=${encodeURIComponent(params.rawToken)}`);
  const displayName = String(params.fullName || "").trim() || "مستخدم ينفع";

  try {
    const resend = new Resend(config.apiKey);
    const result = await resend.emails.send({
      from: config.from,
      to: params.to,
      subject: "إعادة تعيين كلمة المرور",
      html: `
        <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.7;color:#0f172a">
          <p>مرحبًا ${escapeHtml(displayName)}،</p>
          <p>تلقّينا طلبًا لإعادة تعيين كلمة المرور لحسابك في منصة ينفع.</p>
          <p>
            <a href="${resetUrl}" style="display:inline-block;padding:12px 18px;background:#2563eb;color:#fff;text-decoration:none;border-radius:10px;font-weight:700">
              إعادة تعيين كلمة المرور
            </a>
          </p>
          <p style="font-size:14px;color:#475569">هذا الرابط مؤقت وينتهي خلال ساعة واحدة، ويُستخدم مرة واحدة فقط.</p>
          <p style="font-size:14px;color:#475569">إذا لم تطلب إعادة التعيين، يمكنك تجاهل هذه الرسالة بأمان ولن يتم تغيير كلمة مرورك.</p>
          <p style="font-size:12px;color:#94a3b8;word-break:break-all">${escapeHtml(resetUrl)}</p>
        </div>
      `,
      text: [
        `مرحبًا ${displayName}،`,
        "",
        "تلقّينا طلبًا لإعادة تعيين كلمة المرور لحسابك في منصة ينفع.",
        `رابط إعادة التعيين (مؤقت لمدة ساعة ويُستخدم مرة واحدة): ${resetUrl}`,
        "",
        "إذا لم تطلب إعادة التعيين، تجاهل هذه الرسالة.",
      ].join("\n"),
    });

    if (result.error) {
      console.error("[password-reset][email] Resend send failed.");
      return { ok: false, reason: "resend_send_failed" };
    }
    return { ok: true };
  } catch {
    console.error("[password-reset][email] Unexpected send error.");
    return { ok: false, reason: "resend_send_failed" };
  }
}

function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
