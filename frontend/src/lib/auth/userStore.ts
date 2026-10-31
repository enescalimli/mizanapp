import crypto from "crypto";
import fs from "fs";
import path from "path";

export interface StoredUser {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

const LOCAL_USER_FILE = path.join(process.cwd(), ".user_cache.json");

// In-memory user registry for the running server instance
const globalForUsers = globalThis as unknown as {
  mizanUserStore?: Map<string, StoredUser>;
};

export const userStore = globalForUsers.mizanUserStore ?? new Map<string, StoredUser>();
if (process.env.NODE_ENV !== "production") globalForUsers.mizanUserStore = userStore;

function loadLocalUserCache(): void {
  try {
    if (fs.existsSync(LOCAL_USER_FILE)) {
      const content = fs.readFileSync(LOCAL_USER_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === "object") {
        for (const [email, user] of Object.entries(parsed)) {
          userStore.set(email.toLowerCase(), user as StoredUser);
        }
      }
    }
  } catch {
    // Non-fatal
  }
}

function saveLocalUserCache(): void {
  try {
    const obj: Record<string, StoredUser> = {};
    userStore.forEach((v, k) => {
      obj[k] = v;
    });
    fs.writeFileSync(LOCAL_USER_FILE, JSON.stringify(obj, null, 2), "utf-8");
  } catch {
    // Non-fatal
  }
}

// Load existing local cache
loadLocalUserCache();

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
}

export function registerUser(
  email: string,
  fullName: string,
  password: string
): { success: boolean; user?: StoredUser; error?: string } {
  const normalizedEmail = email.toLowerCase().trim();

  if (userStore.has(normalizedEmail)) {
    return {
      success: false,
      error: "Bu e-posta adresiyle kayıtlı bir hesap zaten bulunmaktadır.",
    };
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
  saveLocalUserCache();

  return { success: true, user: newUser };
}

export function authenticateUser(
  email: string,
  password: string
): { success: boolean; user?: StoredUser; error?: string } {
  const normalizedEmail = email.toLowerCase().trim();
  const user = userStore.get(normalizedEmail);

  if (!user) {
    return {
      success: false,
      error: "Bu e-posta adresiyle kayıtlı bir hesap bulunamadı.",
    };
  }

  const computedHash = hashPassword(password, user.salt);

  // Timing-safe comparison to prevent side-channel timing attacks
  const bufA = Buffer.from(computedHash, "hex");
  const bufB = Buffer.from(user.passwordHash, "hex");

  if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
    return {
      success: false,
      error: "Girdiğiniz şifre hatalıdır. Lütfen kontrol ediniz.",
    };
  }

  return { success: true, user };
}
