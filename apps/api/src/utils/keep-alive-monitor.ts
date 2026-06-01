import type { KeepAliveStatus } from "../types/keep-alive.types.js";

class KeepAliveMonitor {
  private status: KeepAliveStatus = {
    databaseStatus: "unreachable",
    lastSuccessfulPing: null,
    consecutiveFailures: 0,
    lastAttempt: null,
  };

  recordSuccess(latencyMs: number): void {
    const now = new Date().toISOString();
    this.status.databaseStatus = "reachable";
    this.status.lastSuccessfulPing = now;
    this.status.consecutiveFailures = 0;
    this.status.lastAttempt = now;
    console.log(
      `[KeepAlive] Ping successful | Latency: ${latencyMs}ms | Time: ${now}`,
    );
  }

  recordFailure(error: string): void {
    const now = new Date().toISOString();
    this.status.databaseStatus = "unreachable";
    this.status.consecutiveFailures += 1;
    this.status.lastAttempt = now;
    console.error(
      `[KeepAlive] Ping failed | Error: ${error} | Failures: ${this.status.consecutiveFailures} | Time: ${now}`,
    );
  }

  getStatus(): KeepAliveStatus {
    return { ...this.status };
  }
}

export const keepAliveMonitor = new KeepAliveMonitor();
