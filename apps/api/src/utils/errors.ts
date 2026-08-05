export function getErrorMessage(error: unknown, fallback: string): string {
  if (
    error &&
    typeof error === "object" &&
    typeof (error as { statusCode?: unknown }).statusCode === "number" &&
    Number((error as { statusCode?: number }).statusCode) < 500 &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  console.error("[API error]", error);
  return fallback;
}
