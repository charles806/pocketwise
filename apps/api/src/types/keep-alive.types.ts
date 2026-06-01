export interface KeepAliveStatus {
  databaseStatus: "reachable" | "unreachable";
  lastSuccessfulPing: string | null;
  consecutiveFailures: number;
  lastAttempt: string | null;
}

export interface KeepAliveResult {
  success: boolean;
  latencyMs: number;
  error?: string;
}

export interface KeepAliveConfig {
  secret: string;
  intervalMinutes: number;
  maxRetries: number;
  baseDelayMs: number;
}
