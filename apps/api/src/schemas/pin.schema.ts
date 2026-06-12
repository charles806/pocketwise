import { z } from "zod";

const WEAK_PINS = new Set([
  "0000",
  "1111",
  "2222",
  "3333",
  "4444",
  "5555",
  "6666",
  "7777",
  "8888",
  "9999",
  "1234",
  "2345",
  "3456",
  "4567",
  "5678",
  "6789",
  "4321",
  "5432",
  "6543",
  "7654",
  "8765",
  "9876",
]);

const isWeakPin = (pin: string) => WEAK_PINS.has(pin);

const pinSchema = z
  .string()
  .length(4, "PIN must be exactly 4 digits")
  .regex(/^\d{4}$/, "PIN must contain only numbers")
  .refine((pin) => !isWeakPin(pin), {
    message: "PIN too simple, choose something stronger",
  });

export const setupPinSchema = z
  .object({
    pin: pinSchema,
    confirmPin: z.string(),
  })
  .refine((data) => data.pin === data.confirmPin, {
    message: "PINs do not match",
    path: ["confirmPin"],
  });

export const changePinSchema = z
  .object({
    currentPin: z.string().length(4, "Current PIN must be 4 digits"),
    newPin: pinSchema,
    confirmNewPin: z.string(),
  })
  .refine((data) => data.newPin === data.confirmNewPin, {
    message: "New PINs do not match",
    path: ["confirmNewPin"],
  });

export type SetupPinInput = z.infer<typeof setupPinSchema>;
export type ChangePinInput = z.infer<typeof changePinSchema>;
