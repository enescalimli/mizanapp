/**
 * In-Memory OTP Store with 10-minute TTL
 */
interface OtpRecord {
  code: string;
  fullName: string;
  expiresAt: number;
  attempts: number;
}

// Global variable to survive HMR in development
const globalForOtp = globalThis as unknown as {
  mizanOtpStore?: Map<string, OtpRecord>;
};

export const otpStore = globalForOtp.mizanOtpStore ?? new Map<string, OtpRecord>();
if (process.env.NODE_ENV !== "production") globalForOtp.mizanOtpStore = otpStore;

export function storeOtp(email: string, fullName: string, code: string): void {
  const normalizedEmail = email.toLowerCase().trim();
  otpStore.set(normalizedEmail, {
    code,
    fullName,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    attempts: 0,
  });
}

export function verifyOtp(email: string, code: string): { valid: boolean; fullName?: string; error?: string } {
  const normalizedEmail = email.toLowerCase().trim();
  const record = otpStore.get(normalizedEmail);

  if (!record) {
    return { valid: false, error: "Doğrulama kodu bulunamadı veya süresi doldu. Lütfen yeni kod isteyiniz." };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalizedEmail);
    return { valid: false, error: "Doğrulama kodunun 10 dakikalık süresi doldu. Lütfen yeni kod isteyiniz." };
  }

  if (record.attempts >= 5) {
    otpStore.delete(normalizedEmail);
    return { valid: false, error: "Çok fazla hatalı deneme yaptınız. Güvenliğiniz için lütfen yeni kod talep ediniz." };
  }

  if (record.code !== code.trim()) {
    record.attempts += 1;
    return { valid: false, error: `Hatalı güvenlik kodu girdiniz (${5 - record.attempts} deneme hakkı kaldı).` };
  }

  // Verification successful -> invalidate code
  const fullName = record.fullName;
  otpStore.delete(normalizedEmail);
  return { valid: true, fullName };
}
