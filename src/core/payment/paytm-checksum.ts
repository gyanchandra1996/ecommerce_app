import crypto from "crypto";

export class PaytmChecksum {
  private static iv = "@@@@&&&&####$$$$";

  /**
   * Normalizes the merchant key to exactly 16 bytes for AES-128-CBC.
   */
  public static normalizeKey(key: string): Buffer {
    const raw = Buffer.from(key || "paytm_sec_key_16", "utf8");
    if (raw.length === 16) {
      return raw;
    }
    const buf = Buffer.alloc(16, 0);
    raw.copy(buf, 0, 0, Math.min(raw.length, 16));
    return buf;
  }

  public static encrypt(input: string, key: string | Buffer): string {
    const keyBuf = typeof key === "string" ? this.normalizeKey(key) : key;
    const cipher = crypto.createCipheriv("AES-128-CBC", keyBuf, Buffer.from(this.iv));
    let encrypted = cipher.update(input, "binary", "base64");
    encrypted += cipher.final("base64");
    return encrypted;
  }

  public static decrypt(encrypted: string, key: string | Buffer): string {
    const keyBuf = typeof key === "string" ? this.normalizeKey(key) : key;
    const decipher = crypto.createDecipheriv("AES-128-CBC", keyBuf, Buffer.from(this.iv));
    let decrypted = decipher.update(encrypted, "base64", "binary");
    try {
      decrypted += decipher.final("binary");
    } catch {
      // Ignored
    }
    return decrypted;
  }

  public static async generateSignature(params: any, key: string): Promise<string> {
    let dataStr = typeof params === "string" ? params : JSON.stringify(params);
    const salt = await this.generateRandomString(4);
    const finalString = dataStr + "|" + salt;
    const hash = crypto.createHash("sha256").update(finalString).digest("hex") + salt;
    return this.encrypt(hash, key);
  }

  public static verifySignature(params: any, key: string, checksum: string): boolean {
    if (!checksum) return false;
    try {
      let dataStr = typeof params === "string" ? params : JSON.stringify(params);
      const paytmHash = this.decrypt(checksum, key);
      const salt = paytmHash.substring(paytmHash.length - 4);
      const expectedHash = crypto.createHash("sha256").update(dataStr + "|" + salt).digest("hex") + salt;
      return paytmHash === expectedHash;
    } catch {
      return false;
    }
  }

  private static generateRandomString(length: number): Promise<string> {
    return new Promise((resolve, reject) => {
      crypto.randomBytes((length * 3.0) / 4.0, (err, buf) => {
        if (err) {
          reject(err);
        } else {
          resolve(buf.toString("base64"));
        }
      });
    });
  }
}
