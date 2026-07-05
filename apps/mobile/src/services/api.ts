import { Platform } from "react-native";

function getApiUrl(): string {
  const raw = process.env.EXPO_PUBLIC_API_URL;

  if (!raw) {
    throw new Error(
      "EXPO_PUBLIC_API_URL is not set. Check your .env file and restart Metro with --clear."
    );
  }

  const hostOverride = process.env.EXPO_PUBLIC_API_HOST;
  if (hostOverride) {
    const url = new URL(raw);
    url.hostname = hostOverride;
    return url.toString().replace(/\/+$/, "");
  }

  if (Platform.OS === "android") {
    return raw.replace("localhost", "10.0.2.2");
  }

  return raw;
}

const API_URL = getApiUrl();

type RequestOptions = {
  //For HTTP Requests
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  //For req,body
  body?: unknown;
  //For Headers
  headers?: Record<string, string>;
  timeout?: number;
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, headers = {}, timeout = 10000 } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new ApiError(
        errorBody?.message || `Request failed with status ${response.status}`,
        response.status,
      );
    }

    if (response.status === 204) return null as T;
    return await response.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) throw err;
    if (err.name === "AbortError") throw new ApiError("Request timed out", 408);
    throw err;
  }
}

export const api = {
  get: <T>(path: string, headers?: Record<string, string>) =>
    request<T>(path, { method: "GET", headers }),
  post: <T>(path: string, body?: unknown, headers?: Record<string, string>) =>
    request<T>(path, { method: "POST", body, headers }),
  put: <T>(path: string, body?: unknown, headers?: Record<string, string>) =>
    request<T>(path, { method: "PUT", body, headers }),
  patch: <T>(path: string, body?: unknown, headers?: Record<string, string>) =>
    request<T>(path, { method: "PATCH", body, headers }),
  delete: <T>(path: string, headers?: Record<string, string>) =>
    request<T>(path, { method: "DELETE", headers }),
};
