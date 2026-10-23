import crypto from "crypto";

export interface StoredUser {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

const AUTH_SECRET = process.env.OTP_SECRET || "mizanapp_katilim_super_secret_otp_token_2026_fra";

// In-memory user registry for the running server instance
const globalForUsers = globalThis as unknown as {
  mizanUserStore?: Map<string, StoredUser>;
};

export const userStore = globalForUsers.mizanUserStore ?? new Map<string, StoredUser>();
if (process.env.NODE_ENV !== "production") globalForUsers.mizanUserStore = userStore;

// Default initial verified account for Mustafa Enes Çalımlı
// Seeded with a secure cryptographic salt
if (!userStore.has("mustafaenescalimli@gmail.com")) {
  const defaultSalt = crypto.randomBytes(16).toString("hex");
  const defaultHash = hashPassword("Mizan2026!", defaultSalt);
  userStore.set("mustafaenescalimli@gmail.com", {
    id: "usr-mustafa-01",
    email: "mustafaenescalimli@gmail.com",
    fullName: "Mustafa Enes Çalımlı",
    passwordHash: defaultHash,
    salt: defaultSalt,
    createdAt: new Date().toISOString(),
  });
}

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
}

export function registerUser(email: string, fullName: string, password: string): { success: boolean; user?: StoredUser; error?: string } {
  const normalizedEmail = email.toLowerCase().trim();
  
  if (userStore.has(normalizedEmail)) {
    return { success: false, error: "Bu e-posta adresiyle kayıtlı bir hesap zaten bulunmaktadır." };
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, salt);

  const newUser: StoredUser = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    email: normalizedEmail,
    fullName: fullName.trim() || normalizedEmail.split("@")[0],
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
  };

  userStore.set(normalizedEmail, newUser);
  return { success: true, user: newUser };
}

export function authenticateUser(email: string, password: string): { success: boolean; user?: StoredUser; error?: string } {
  const normalizedEmail = email.toLowerCase().trim();
  const user = userStore.get(normalizedEmail);

  if (!user) {
    return { success: false, error: "Bu e-posta adresiyle kayıtlı bir hesap bulunamadı." };
  }

  const computedHash = hashPassword(password, user.salt);
  
  // Timing-safe comparison to prevent side-channel timing attacks
  const bufA = Buffer.from(computedHash, "hex");
  const bufB = Buffer.from(user.passwordHash, "hex");

  if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
    return { success: false, error: "Girdiğiniz şifre hatalıdır. Lütfen kontrol ediniz." };
  }

  return { success: true, user };
}
