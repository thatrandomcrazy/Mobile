// Server/services/twilio.ts
import twilio, { Twilio } from "twilio";

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
  throw new Error("Missing Twilio env vars (ACCOUNT_SID, AUTH_TOKEN, PHONE_NUMBER)");
}

const client: Twilio = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// ☑️ אחסון זמני של OTP בזיכרון (לפרודקשן עדיף Redis/DB)
const otpStore = new Map<string, { code: string; expiresAt: number }>();
const OTP_TTL_MS = 5 * 60 * 1000; // 5 דקות

function genCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * שליחת קוד אימות ב-SMS (ללא Verify Service)
 * שמרתי את החתימה עם channel כדי שלא תצטרך לגעת בקונטרולרים.
 */
export async function sendVerification(to: string, _channel: "sms" | "call" = "sms") {
  const code = genCode();
  const expiresAt = Date.now() + OTP_TTL_MS;
  otpStore.set(to, { code, expiresAt });

  await client.messages.create({
    body: `Your verification code is: ${code}`,
    from: TWILIO_PHONE_NUMBER,
    to,
  });

  return { to };
}

/**
 * בדיקת קוד אימות מול הסטור המקומי
 */
export async function checkVerification(to: string, code: string) {
  const entry = otpStore.get(to);
  if (!entry) return { status: "failed" };

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(to);
    return { status: "failed" };
  }

  if (entry.code !== code) return { status: "failed" };

  otpStore.delete(to); // one-time
  return { status: "approved" };
}
