import { env } from "cloudflare:workers";

type ResetEmailPayload = { email: string; resetLink: string };

export function passwordResetLink(token: string) {
  const configuredBase = (env as unknown as { PASSWORD_RESET_BASE_URL?: string }).PASSWORD_RESET_BASE_URL;
  const base = configuredBase && /^https:\/\//.test(configuredBase) ? configuredBase : "https://bearingmartbd.com";
  const url = new URL("/customer-password-reset/confirm", base);
  url.searchParams.set("token", token);
  return url.toString();
}

export async function sendPasswordResetEmail(payload: ResetEmailPayload) {
  const settings = env as unknown as { PASSWORD_RESET_EMAIL_WEBHOOK_URL?: string; PASSWORD_RESET_EMAIL_WEBHOOK_TOKEN?: string };
  if (!settings.PASSWORD_RESET_EMAIL_WEBHOOK_URL) return false;
  const response = await fetch(settings.PASSWORD_RESET_EMAIL_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(settings.PASSWORD_RESET_EMAIL_WEBHOOK_TOKEN ? { authorization: `Bearer ${settings.PASSWORD_RESET_EMAIL_WEBHOOK_TOKEN}` } : {}),
    },
    body: JSON.stringify({ type: "bearingmartbd.customer-password-reset", ...payload }),
  });
  return response.ok;
}
