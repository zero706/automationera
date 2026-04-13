import { Resend } from "resend";
import type { Lead } from "@/types";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Missing RESEND_API_KEY");
  _resend = new Resend(key);
  return _resend;
}

const FROM = process.env.RESEND_FROM_EMAIL ?? "alerts@leadhuntr.com";

function renderLeadRow(lead: Lead): string {
  const color =
    lead.intent_score >= 80
      ? "#22c55e"
      : lead.intent_score >= 50
        ? "#f59e0b"
        : "#ef4444";

  return `
    <tr>
      <td style="padding:16px;border-bottom:1px solid #1e1e2e;">
        <div style="display:inline-block;padding:2px 8px;background:#1e1e2e;color:#a5b4fc;border-radius:999px;font-size:11px;font-weight:600;">r/${escapeHtml(lead.subreddit)}</div>
        <span style="display:inline-block;margin-left:8px;color:${color};font-family:monospace;font-weight:700;">${lead.intent_score}</span>
        <div style="color:#f1f1f1;font-weight:600;margin:8px 0 4px 0;font-size:15px;">${escapeHtml(lead.title)}</div>
        <div style="color:#8b8b9e;font-size:13px;line-height:1.5;">${escapeHtml(lead.ai_summary ?? "")}</div>
        <a href="${escapeHtml(lead.permalink)}" style="display:inline-block;margin-top:10px;color:#6366f1;text-decoration:none;font-size:13px;">Open on Reddit →</a>
      </td>
    </tr>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapEmail(title: string, inner: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#12121a;border:1px solid #1e1e2e;border-radius:12px;overflow:hidden;">
        <tr><td style="padding:24px 24px 0 24px;">
          <div style="font-size:20px;font-weight:700;color:#f1f1f1;">LeadHuntr</div>
          <div style="font-size:13px;color:#8b8b9e;margin-top:4px;">${escapeHtml(title)}</div>
        </td></tr>
        ${inner}
        <tr><td style="padding:20px 24px;border-top:1px solid #1e1e2e;color:#5a5a6e;font-size:12px;">
          You're receiving this because you have email alerts enabled.
          <a href="${escapeHtml(process.env.NEXT_PUBLIC_APP_URL ?? "")}/dashboard/settings" style="color:#6366f1;text-decoration:none;">Manage preferences</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendHotLeadEmail(to: string, lead: Lead): Promise<void> {
  const html = wrapEmail(
    `Hot lead found (score ${lead.intent_score})`,
    `<tr><td>${renderLeadRow(lead)}</td></tr>`,
  );
  await getResend().emails.send({
    from: FROM,
    to,
    subject: `🔥 Hot lead: ${lead.title.slice(0, 60)}`,
    html,
  });
}

export async function sendDigestEmail(
  to: string,
  leads: Lead[],
): Promise<void> {
  if (leads.length === 0) return;
  const rows = leads.map(renderLeadRow).join("");
  const html = wrapEmail(
    `Your daily digest — ${leads.length} new leads`,
    `<tr><td><table width="100%" cellpadding="0" cellspacing="0">${rows}</table></td></tr>`,
  );
  await getResend().emails.send({
    from: FROM,
    to,
    subject: `Your LeadHuntr digest — ${leads.length} new leads`,
    html,
  });
}
