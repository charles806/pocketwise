export function generateMockAccountNumber(): string {
  // NUBAN format - 10 digits, starts with a realistic prefix
  const prefix = "92"; // mock prefix
  const random = Math.floor(Math.random() * 99999999).toString().padStart(8, "0");
  return `${prefix}${random}`;
}