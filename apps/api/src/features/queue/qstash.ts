import { Client, Receiver } from "@upstash/qstash";

export const qstashClient = new Client({
  ...(process.env.QSTASH_URL ? { baseUrl: process.env.QSTASH_URL } : {}),
  token: process.env.QSTASH_TOKEN ?? "",
});

export const qstashReceiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY ?? "",
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY ?? "",
});

export const isQstashConfigured = (): boolean =>
  Boolean(
    process.env.QSTASH_TOKEN &&
      process.env.QSTASH_CURRENT_SIGNING_KEY &&
      process.env.QSTASH_NEXT_SIGNING_KEY,
  );
