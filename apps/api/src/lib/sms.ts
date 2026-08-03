import fetch from "node-fetch";

const BULKSMS_API_TOKEN = process.env.BULKSMS_API_TOKEN;
const BULKSMS_SENDER_ID = process.env.BULKSMS_SENDER_ID;
const BULKSMS_BASE_URL = process.env.BULKSMS_BASE_URL;

const SUCCESS_CODE = "BSNG-0000";

interface BulkSMSResponse {
  status?: string;
  code?: string;
  message?: string;
  error?: { message?: string; code?: string; description?: string };
  data?: Record<string, unknown>;
  balance?: {
    total_balance?: number;
    universal_wallet?: string;
    sms_wallet?: string;
    sms_bonus?: string;
  };
}

export function formatNigerianPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) return `234${cleaned.slice(1)}`;
  if (cleaned.startsWith("234")) return cleaned;
  return cleaned;
}

function extractErrorMessage(data: BulkSMSResponse): string {
  return (
    data.error?.message ||
    data.error?.description ||
    data.message ||
    data.error?.code ||
    data.code ||
    "Failed to send SMS"
  );
}

export async function checkSMSCredit() {
  if (!BULKSMS_API_TOKEN) {
    throw new Error("BulkSMS Nigeria credentials not configured");
  }

  const res = await fetch(`${BULKSMS_BASE_URL}/balance`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${BULKSMS_API_TOKEN}`,
      Accept: "application/json",
    },
  });

  const data = (await res.json()) as BulkSMSResponse;

  if (data.code && data.code !== SUCCESS_CODE) {
    throw new Error(extractErrorMessage(data));
  }

  return {
    smsWallet: Number(data.balance?.sms_wallet || 0),
    totalBalance: Number(data.balance?.total_balance || 0),
  };
}

export async function sendSMS(to: string, message: string) {
  if (!BULKSMS_API_TOKEN || !BULKSMS_SENDER_ID) {
    throw new Error("BulkSMS Nigeria credentials not configured");
  }

  try {
    const { smsWallet, totalBalance } = await checkSMSCredit();
    if (smsWallet <= 0) {
      console.error(
        `[sendSMS] SMS wallet balance is 0 (universal wallet has ${totalBalance}). ` +
          "SMS will not be delivered until SMS credits are topped up.",
      );
    }
  } catch (creditError) {
    console.error("[sendSMS] Failed to check SMS credit:", creditError);
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

  const data = (await res.json()) as BulkSMSResponse;

  const isSuccess =
    res.ok && data.code === SUCCESS_CODE && data.status === "success";

  if (!isSuccess) {
    const errorMsg = extractErrorMessage(data);
    console.error("[sendSMS] BulkSMS Nigeria error:", {
      status: res.status,
      body: data,
      formattedPhone,
    });
    throw new Error(errorMsg);
  }

  return data;
}
