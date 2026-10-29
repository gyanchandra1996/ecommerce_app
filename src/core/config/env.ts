export const APP_CONFIG = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || "emox Admin",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  apiKey: process.env.API_KEY || "gstore_mobile_dev_key_2026_x89f",
  jwtSecret: process.env.JWT_SECRET || "ecommerce_super_secure_jwt_secret_key_2026_!@#",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  cookieName: "auth_token",
  adminCookieName: "admin_token",
  customerCookieName: "customer_token",
  uploadDir: process.env.UPLOAD_DIR || "public/uploads",
  maxUploadSizeBytes: (Number(process.env.MAX_UPLOAD_SIZE_MB) || 50) * 1024 * 1024,
  allowedMimeTypes: [
    // Images
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
    "image/avif",
    // Videos
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
    // Audio
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
    // Documents
    "application/pdf",
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
};
