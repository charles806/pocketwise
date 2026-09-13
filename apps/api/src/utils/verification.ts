export interface VerificationSubject {
  kycTier: number;
  baasAccountId: string | null;
}

export const isVerifiedUser = (user: VerificationSubject): boolean =>
  user.kycTier >= 1 && !!user.baasAccountId;

export const requireVerifiedError = Object.assign(
  new Error(
    "Please complete identity verification (KYC) before making transfers.",
  ),
  { statusCode: 400 },
);