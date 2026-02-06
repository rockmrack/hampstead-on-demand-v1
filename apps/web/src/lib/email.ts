/**
 * Shared email utilities for Hampstead On Demand.
 *
 * All transactional emails go through here so styling and delivery
 * are consistent. Emails are only sent when EMAIL_SERVER is configured.
 */

import { createTransport } from "nodemailer";

// ─── Configuration ──────────────────────────────────────────────────────────

function getTransport() {
  const server = process.env.EMAIL_SERVER;
  if (!server) return null;
  return createTransport(server);
}

const fromAddress = () => process.env.EMAIL_FROM || "noreply@hampstead.com";
const appUrl = () => process.env.NEXTAUTH_URL || "https://hampstead-on-demand-v1.vercel.app";

// ─── Layout wrapper ─────────────────────────────────────────────────────────

function layout(body: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#fafaf9;">
  <div style="max-width:480px;margin:0 auto;padding:32px 16px;">
    <div style="margin-bottom:24px;">
      <span style="font-size:18px;font-weight:600;color:#1c1917;">Hampstead On Demand</span>
    </div>
    ${body}
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e7e5e4;">
      <p style="font-size:12px;color:#a8a29e;margin:0;">
        Hampstead On Demand — Members-only property services for NW3, NW6 &amp; NW8
      </p>
    </div>
  </div>
</body>
</html>`.trim();
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#1c1917;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:6px;font-size:14px;font-weight:500;margin:16px 0;">${label}</a>`;
}

// ─── Send helper ────────────────────────────────────────────────────────────

async function send(to: string, subject: string, html: string, text: string) {
  const transport = getTransport();
  if (!transport) return;

  try {
    await transport.sendMail({
      to,
      from: fromAddress(),
      subject,
      text,
      html: layout(html),
    });
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
  }
}

// ─── Email functions ────────────────────────────────────────────────────────

/** Notify member that their membership has been approved */
export async function sendMembershipApprovedEmail(email: string) {
  const url = `${appUrl()}/app`;
  await send(
    email,
    "Your Hampstead membership is active",
    `
      <p style="color:#44403c;font-size:15px;line-height:1.6;">
        Good news — your membership has been approved. You can now submit
        service requests through Hampstead On Demand.
      </p>
      ${button(url, "Go to dashboard")}
    `,
    `Your Hampstead On Demand membership has been approved. Visit ${url} to get started.`
  );
}

/** Notify member that their membership was rejected */
export async function sendMembershipRejectedEmail(email: string) {
  await send(
    email,
    "Hampstead membership update",
    `
      <p style="color:#44403c;font-size:15px;line-height:1.6;">
        Thank you for your interest. Unfortunately we're unable to approve your
        membership at this time. If you believe this is an error, please reply
        to this email.
      </p>
    `,
    "Thank you for your interest in Hampstead On Demand. Unfortunately we're unable to approve your membership at this time."
  );
}

/** Notify member of a status change on their request */
export async function sendStatusChangeEmail(
  email: string,
  requestId: string,
  oldStatus: string,
  newStatus: string
) {
  const url = `${appUrl()}/app/requests/${requestId}`;
  const readable = newStatus.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
  await send(
    email,
    `Your request status: ${readable}`,
    `
      <p style="color:#44403c;font-size:15px;line-height:1.6;">
        The status of your request has been updated to <strong>${readable}</strong>.
      </p>
      ${button(url, "View request")}
    `,
    `Your request status has changed to ${readable}. View it at: ${url}`
  );
}

/** Notify member that a quote has been sent */
export async function sendQuoteSentEmail(email: string, requestId: string) {
  const url = `${appUrl()}/app/requests/${requestId}`;
  await send(
    email,
    "You have a new quote to review",
    `
      <p style="color:#44403c;font-size:15px;line-height:1.6;">
        A quote has been prepared for your request. Please review and
        accept or decline at your convenience.
      </p>
      ${button(url, "Review quote")}
    `,
    `A quote has been sent for your request. Review it at: ${url}`
  );
}

/** Notify member of a new admin message */
export async function sendAdminReplyEmail(
  email: string,
  requestId: string,
  messagePreview: string
) {
  const url = `${appUrl()}/app/requests/${requestId}`;
  const preview = messagePreview.length > 200 ? messagePreview.slice(0, 200) + "…" : messagePreview;
  await send(
    email,
    "New message on your Hampstead request",
    `
      <p style="color:#44403c;font-size:15px;line-height:1.6;">
        You have a new message from the Hampstead team:
      </p>
      <div style="background:#f5f5f4;border-radius:8px;padding:12px 16px;margin:12px 0;">
        <p style="color:#44403c;font-size:14px;line-height:1.5;margin:0;white-space:pre-wrap;">${preview}</p>
      </div>
      ${button(url, "View conversation")}
    `,
    `New message on your request:\n\n${messagePreview}\n\nView it at: ${url}`
  );
}

/** Notify admin that a member accepted/rejected a quote */
export async function sendQuoteResponseEmail(
  adminEmail: string,
  requestId: string,
  memberEmail: string,
  action: "accept" | "reject"
) {
  const url = `${appUrl()}/admin/requests/${requestId}`;
  const verb = action === "accept" ? "accepted" : "rejected";
  await send(
    adminEmail,
    `Quote ${verb} — ${memberEmail}`,
    `
      <p style="color:#44403c;font-size:15px;line-height:1.6;">
        <strong>${memberEmail}</strong> has <strong>${verb}</strong> the quote
        on request ${requestId.slice(0, 8)}…
      </p>
      ${button(url, "View request")}
    `,
    `${memberEmail} has ${verb} the quote. View: ${url}`
  );
}

/** Notify admins that a member cancelled their request */
export async function sendRequestCancelledEmail(email: string, requestId: string) {
  const url = `${appUrl()}/admin/requests/${requestId}`;
  await send(
    email,
    "A member has cancelled their request",
    `
      <p style="color:#44403c;font-size:15px;line-height:1.6;">
        A member has cancelled request <strong>${requestId.slice(0, 8)}…</strong>.
        You can review the details and audit trail below.
      </p>
      ${button(url, "View request")}
    `,
    `A member has cancelled a request. View it at: ${url}`
  );
}
