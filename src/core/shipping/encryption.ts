import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
// 32-byte key derived from SECRET or default dev fallback
const SECRET_SEED = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || "shipping-modular-secret-key-salt-32bytes!";
const KEY = crypto.createHash("sha256").update(SECRET_SEED).digest();
const IV_LENGTH = 16;

/**
 * Encrypts a plain text string or serializable object into an encrypted string (iv:hex).
 */
export function encryptCredentials(plainValue: string | Record<string, any>): string {
  try {
    const rawText = typeof plainValue === "string" ? plainValue : JSON.stringify(plainValue);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    let encrypted = cipher.update(rawText, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
  } catch (err) {
    console.error("Encryption error:", err);
    // In case of parsing failure, fallback safely
    return typeof plainValue === "string" ? plainValue : JSON.stringify(plainValue);
  }
}

/**
 * Decrypts an encrypted credential payload. If already decrypted or invalid, returns parsed JSON or string.
 */
export function decryptCredentials<T = Record<string, any>>(cipherText: string | any): T {
  if (!cipherText) return {} as T;
  if (typeof cipherText !== "string") return cipherText as T;

  const parts = cipherText.split(":");
  if (parts.length !== 2) {
    // Might already be raw JSON
    try {
      return JSON.parse(cipherText);
    } catch {
      return cipherText as unknown as T;
    }
  }

  try {
    const iv = Buffer.from(parts[0], "hex");
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted as unknown as T;
    }
  } catch {
    // Fallback if not valid ciphertext
    try {
      return JSON.parse(cipherText);
    } catch {
      return cipherText as unknown as T;
    }
  }
}

/**
 * Masks sensitive keys (passwords, secrets, api tokens) for safe frontend consumption.
 */
export function maskSensitiveCredentials(creds: Record<string, any> | null | undefined): Record<string, any> {
  if (!creds || typeof creds !== "object") return {};
  const masked: Record<string, any> = {};

  const sensitiveFieldNames = [
    "password",
    "secret",
    "apisecret",
    "clientsecret",
    "token",
    "apitoken",
    "webhooksecret",
    "privatekey",
  ];

  for (const [key, value] of Object.entries(creds)) {
    if (value === undefined || value === null) continue;
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveFieldNames.some((s) => lowerKey.includes(s));

    if (isSensitive) {
      const strVal = String(value);
      if (strVal.length <= 4) {
        masked[key] = "••••••••";
      } else {
        masked[key] = `${strVal.slice(0, 3)}••••••••${strVal.slice(-3)}`;
      }
      masked[`${key}_isConfigured`] = true;
    } else {
      masked[key] = value;
    }
  }

  return masked;
}
