import fetch from "node-fetch";

const BULKSMS_API_TOKEN = process.env.BULKSMS_API_TOKEN;
const BULKSMS_SENDER_ID = process.env.BULKSMS_SENDER_ID;
const BULKSMS_BASE_URL = "https://www.bulksmsnigeria.com/api/v2";

export function formatNigerianPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) return `234${cleaned.slice(1)}`;
  if (cleaned.startsWith("234")) return cleaned;
  return cleaned;
}

export async function sendSMS(to: string, message: string) {
  if (!BULKSMS_API_TOKEN || !BULKSMS_SENDER_ID) {
    throw new Error("BulkSMS Nigeria credentials not configured");
  }

  const formattedPhone = formatNigerianPhone(to);

  const res = await fetch(`${BULKSMS_BASE_URL}/sms`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${BULKSMS_API_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      to: formattedPhone,
      from: BULKSMS_SENDER_ID,
      body: message,
      gateway: "otp",
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const errorMsg =
      (data as any).message || (data as any).error || "Failed to send SMS";
    console.error("[sendSMS] BulkSMS Nigeria error:", {
      status: res.status,
      body: data,
    });
    throw new Error(errorMsg);
  }

  if (data && (data as any).status === "error") {
    console.error("[sendSMS] BulkSMS Nigeria returned error status:", data);
    throw new Error((data as any).message || "Failed to send SMS");
  }

  return data;
}
