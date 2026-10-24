import crypto from "crypto";

const OTP_SECRET = process.env.OTP_SECRET || "mizanapp_katilim_super_secret_otp_token_2026_fra";

interface OtpRecord {
  code: string;
  fullName: string;
  expiresAt: number;
  attempts: number;
}

// In-memory fallback
const globalForOtp = globalThis as unknown as {
  mizanOtpStore?: Map<string, OtpRecord>;
};

export const otpStore = globalForOtp.mizanOtpStore ?? new Map<string, OtpRecord>();
if (process.env.NODE_ENV !== "production") globalForOtp.mizanOtpStore = otpStore;

export function storeOtp(email: string, fullName: string, code: string): string {
  const normalizedEmail = email.toLowerCase().trim();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  // 1. In-memory save
  otpStore.set(normalizedEmail, {
    code,
    fullName,
    expiresAt,
    attempts: 0,
  });

  // 2. Cryptographically signed stateless token for Vercel Serverless
  const payload = `${normalizedEmail}:${encodeURIComponent(fullName)}:${code}:${expiresAt}`;
  const signature = crypto.createHmac("sha256", OTP_SECRET).update(payload).digest("hex");
  return `${Buffer.from(payload).toString("base64url")}.${signature}`;
}

export function verifyOtp(
  email: string,
  code: string,
  token?: string
): { valid: boolean; fullName?: string; error?: string } {
  const normalizedEmail = email.toLowerCase().trim();
  const cleanCode = code.trim();

  // A) Vercel Serverless Stateless Verification (Priority 1)
  if (token && token.includes(".")) {
    try {
      const [b64Payload, providedSig] = token.split(".");
      const payload = Buffer.from(b64Payload, "base64url").toString("utf-8");
      const expectedSig = crypto.createHmac("sha256", OTP_SECRET).update(payload).digest("hex");

      if (providedSig === expectedSig) {
        const [tokenEmail, encodedName, tokenCode, expiresAtStr] = payload.split(":");
        const expiresAt = parseInt(expiresAtStr, 10);
        const fullName = decodeURIComponent(encodedName || "");

        if (tokenEmail !== normalizedEmail) {
          return { valid: false, error: "E-posta adresi eşleşmiyor." };
        }

        if (Date.now() > expiresAt) {
          return { valid: false, error: "Doğrulama kodunun 10 dakikalık süresi doldu. Lütfen yeni kod isteyiniz." };
        }

        if (tokenCode !== cleanCode) {
          return { valid: false, error: "Girdiğiniz 6 haneli kod hatalı. Lütfen e-postanızı kontrol ediniz." };
        }

        // Clean in-memory if present
        otpStore.delete(normalizedEmail);
        return { valid: true, fullName: fullName || normalizedEmail.split("@")[0] || "Katılım Yatırımcısı" };
      }
    } catch (err) {
      console.warn("Stateless token verify error:", err);
    }
  }

  // B) In-Memory Fallback Verification (Priority 2)
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
    return { valid: false, error: "Çok fazla hatalı deneme yapıldı. Lütfen yeni kod talep ediniz." };
  }

  if (record.code !== cleanCode) {
    record.attempts += 1;
    return { valid: false, error: `Hatalı güvenlik kodu girdiniz (${5 - record.attempts} deneme hakkı kaldı).` };
  }

  const fullName = record.fullName;
  otpStore.delete(normalizedEmail);
  return { valid: true, fullName };
}
