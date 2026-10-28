import nodemailer from "nodemailer";
import {
  DatabaseStore,
  type MailConfigurationRecord,
  type EmailTemplateRecord,
} from "@/core/db/store";
import { encryptCredentials, decryptCredentials } from "@/core/shipping/encryption";

export type { MailConfigurationRecord, EmailTemplateRecord };

export interface SendEmailOptions {
  templateCode?: string;
  to: string;
  subject?: string;
  html?: string;
  text?: string;
  variables?: Record<string, any>;
  attachments?: any[];
}

export class EmailService {
  public static maskPassword(pwd?: string): string {
    if (!pwd || pwd.trim() === "") return "";
    return "••••••••";
  }

  public static async getMailConfig(): Promise<MailConfigurationRecord> {
    try {
      const config = await DatabaseStore.getMailConfiguration();
      if (config) return config;
    } catch {}

    return {
      isEnabled: true,
      defaultFromName: "QAReply",
      defaultFromEmail: "qaadmin@example.com",
      defaultReplyName: "tag31",
      defaultReplyTo: "tag31@example.com",
      transportMethod: "SMTP",
      server: "smtp.gmail.com",
      port: 587,
      secureSocketType: "TLS",
      authType: "LOGIN",
      username: "admin@tag.com",
      password: "",
      contactUsEmail: "test2xuark@gmail.com",
      ccMailOption: true,
      ccEmailAddresses: ["dup@example.com", "cc2@example.com"],
    };
  }

  public static async saveMailConfig(data: Partial<MailConfigurationRecord>): Promise<MailConfigurationRecord> {
    const existing = await this.getMailConfig();

    let password = existing.password || "";
    // If a new password is provided and not the masked placeholder, encrypt it
    if (data.password && data.password !== "••••••••" && !data.password.includes(":")) {
      password = encryptCredentials(data.password.trim());
    }

    const updated: MailConfigurationRecord = {
      ...existing,
      ...data,
      password,
      port: Number(data.port) || existing.port || 587,
      isEnabled: data.isEnabled !== undefined ? Boolean(data.isEnabled) : existing.isEnabled,
      ccMailOption: data.ccMailOption !== undefined ? Boolean(data.ccMailOption) : existing.ccMailOption,
      ccEmailAddresses: Array.isArray(data.ccEmailAddresses)
        ? data.ccEmailAddresses.filter(Boolean)
        : existing.ccEmailAddresses,
      updatedAt: new Date().toISOString(),
    };

    await DatabaseStore.saveMailConfiguration(updated);
    return updated;
  }

  public static async testMailConnection(
    targetEmailOrConfig?: string | Partial<MailConfigurationRecord>
  ): Promise<{ success: boolean; message: string }> {
    const savedConfig = await this.getMailConfig();
    const isConfigObj = typeof targetEmailOrConfig === "object" && targetEmailOrConfig !== null;
    const config: MailConfigurationRecord = isConfigObj
      ? { ...savedConfig, ...targetEmailOrConfig }
      : savedConfig;

    const recipient =
      (typeof targetEmailOrConfig === "string" ? targetEmailOrConfig : null) ||
      config.contactUsEmail ||
      config.defaultFromEmail ||
      "test@example.com";

    try {
      let rawPassword = config.password || "";
      if (rawPassword && !rawPassword.includes("••••")) {
        try {
          rawPassword = decryptCredentials<string>(rawPassword);
        } catch {
          // already plaintext
        }
      }
      const transporter = nodemailer.createTransport({
        host: config.server,
        port: config.port,
        secure: config.secureSocketType === "SSL" || config.port === 465,
        auth:
          config.username && rawPassword
            ? {
                user: config.username,
                pass: rawPassword,
              }
            : undefined,
        tls: {
          rejectUnauthorized: false,
        },
      });

      // Verify SMTP transport connection
      await transporter.verify();

      // Send test message
      await transporter.sendMail({
        from: `"${config.defaultFromName}" <${config.defaultFromEmail}>`,
        to: recipient,
        subject: `[Test Email] Verification from ${config.defaultFromName}`,
        text: `This is a test email sent from emox Mail Configuration on ${new Date().toLocaleString()}. SMTP connection is verified successfully.`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: #f8fafc; border-radius: 8px;">
            <h2 style="color: #0f172a;">SMTP Test Succeeded</h2>
            <p style="color: #475569;">Your Mail Configuration is working properly.</p>
            <ul>
              <li><strong>Server:</strong> ${config.server}</li>
              <li><strong>Port:</strong> ${config.port}</li>
              <li><strong>Transport:</strong> ${config.transportMethod}</li>
              <li><strong>From:</strong> ${config.defaultFromEmail}</li>
            </ul>
          </div>
        `,
      });

      return {
        success: true,
        message: `SMTP connection established and test email dispatched successfully to ${recipient}.`,
      };
    } catch (err: any) {
      console.error("[EmailService] SMTP Test failed:", err);
      // For local development or mock environments, provide descriptive guidance
      return {
        success: false,
        message: `SMTP connection failed: ${err.message || "Could not connect to mail server"}. (Check host, port, credentials, and app password)`,
      };
    }
  }

  public static async sendMail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; reason?: string }> {
    const config = await this.getMailConfig();

    // 1. Check master enable/disable toggle
    if (!config.isEnabled) {
      console.log(`[EmailService] Mail Sending is disabled in settings. Skipping email to ${options.to}.`);
      return {
        success: false,
        reason: "Mail sending is disabled in settings",
      };
    }

    let subject = options.subject || "Notification";
    let html = options.html || "";
    let text = options.text || "";

    // 2. If a template code is provided, fetch the template and compile variables
    if (options.templateCode) {
      const template = await DatabaseStore.findEmailTemplateByCode(options.templateCode);
      if (template && template.isActive) {
        subject = template.subject;
        html = template.bodyHtml;
        text = template.bodyText || "";
      }
    }

    // Replace variables e.g. {userName}, {orderId}, [ORDERID], {trackingNumber}
    if (options.variables) {
      for (const [key, val] of Object.entries(options.variables)) {
        const strVal = String(val ?? "");
        const patterns = [
          new RegExp(`\\{${key}\\}`, "gi"),
          new RegExp(`\\[${key.toUpperCase()}\\]`, "gi"),
          new RegExp(`\\[${key}\\]`, "gi"),
        ];
        for (const p of patterns) {
          subject = subject.replace(p, strVal);
          html = html.replace(p, strVal);
          text = text.replace(p, strVal);
        }
      }
    }

    // 3. Dispatch email
    try {
      const rawPassword = config.password ? decryptCredentials<string>(config.password) : "";
      const transporter = nodemailer.createTransport({
        host: config.server,
        port: config.port,
        secure: config.secureSocketType === "SSL" || config.port === 465,
        auth:
          config.username && rawPassword
            ? {
                user: config.username,
                pass: rawPassword,
              }
            : undefined,
        tls: {
          rejectUnauthorized: false,
        },
      });

      const cc = config.ccMailOption && config.ccEmailAddresses?.length ? config.ccEmailAddresses : undefined;

      const info = await transporter.sendMail({
        from: `"${config.defaultFromName}" <${config.defaultFromEmail}>`,
        replyTo: config.defaultReplyTo ? `"${config.defaultReplyName || config.defaultFromName}" <${config.defaultReplyTo}>` : undefined,
        to: options.to,
        cc,
        subject,
        html,
        text,
        attachments: options.attachments,
      });

      console.log(`[EmailService] Email dispatched successfully to ${options.to}. MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.warn(`[EmailService] Notice: Email could not be sent to ${options.to}: ${err.message}. Operation continued gracefully.`);
      return { success: false, reason: err.message };
    }
  }

  // ================= Trigger Helpers =================

  public static async sendUserRegisteredEmail(user: { name?: string; email: string; phone?: string }): Promise<void> {
    await this.sendMail({
      templateCode: "USER_REGISTRATION",
      to: user.email,
      variables: {
        userName: user.name || "Customer",
        name: user.name || "Customer",
        email: user.email,
        phone: user.phone || "N/A",
      },
    });
  }

  public static async sendOrderConfirmedEmail(order: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail?: string | null;
    totalPrice: number;
    shippingAddress?: string | null;
    items?: any[];
  }): Promise<void> {
    if (!order.customerEmail) return;

    const itemsSummary = (order.items || [])
      .map((it: any) => `${it.name} (Qty: ${it.quantity}) - ₹${Number(it.price).toFixed(2)}`)
      .join(", ");

    await this.sendMail({
      templateCode: "ORDER_CONFIRMATION",
      to: order.customerEmail,
      variables: {
        userName: order.customerName,
        orderId: order.orderNumber || order.id,
        orderNumber: order.orderNumber || order.id,
        totalAmount: `₹${Number(order.totalPrice).toFixed(2)}`,
        shippingAddress: order.shippingAddress || "",
        items: itemsSummary,
      },
    });
  }

  public static async sendOrderDispatchedEmail(order: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail?: string | null;
  }, shipment: {
    trackingNumber?: string;
    shippingProviderName?: string;
    trackingUrl?: string;
  }, warehouse?: {
    name?: string;
    city?: string;
  }): Promise<void> {
    if (!order.customerEmail) return;

    await this.sendMail({
      templateCode: "ORDER_DISPATCHED",
      to: order.customerEmail,
      variables: {
        userName: order.customerName,
        orderId: order.orderNumber || order.id,
        orderNumber: order.orderNumber || order.id,
        trackingNumber: shipment.trackingNumber || "N/A",
        carrier: shipment.shippingProviderName || "Standard Logistics",
        warehouse: warehouse?.name || "Main Fulfillment Center",
        trackingUrl: shipment.trackingUrl || "#",
      },
    });
  }

  public static async sendLowInventoryAlert(product: {
    name: string;
    sku: string;
  }, warehouse: {
    name: string;
  }, currentStock: number, reorderLevel: number): Promise<void> {
    const config = await this.getMailConfig();
    const adminEmail = config.contactUsEmail || config.defaultFromEmail;

    await this.sendMail({
      templateCode: "LOW_INVENTORY",
      to: adminEmail,
      variables: {
        productName: product.name,
        sku: product.sku,
        warehouse: warehouse.name,
        currentStock: String(currentStock),
        reorderLevel: String(reorderLevel),
      },
    });
  }

  public static async testConnection(
    targetEmailOrConfig?: string | Partial<MailConfigurationRecord>
  ): Promise<{ success: boolean; message: string }> {
    return this.testMailConnection(targetEmailOrConfig);
  }

  public static async sendLowInventoryEmail(params: {
    productName: string;
    sku: string;
    warehouseName: string;
    currentStock: number;
    reorderLevel: number;
  }): Promise<void> {
    return this.sendLowInventoryAlert(
      { name: params.productName, sku: params.sku },
      { name: params.warehouseName },
      params.currentStock,
      params.reorderLevel
    );
  }
  public static async sendManufacturerCreatedEmail(mfg: {
    name: string;
    email: string;
    contactName: string;
  }): Promise<void> {
    await this.sendMail({
      templateCode: "MANUFACTURER_CREATED",
      to: mfg.email,
      variables: {
        mfgName: mfg.name,
        name: mfg.name,
        contactName: mfg.contactName,
        email: mfg.email,
      },
    });
  }

  public static async sendWarehouseCreatedEmail(wh: {
    name: string;
    email?: string;
    contactName?: string;
  }): Promise<void> {
    if (!wh.email) return;
    await this.sendMail({
      templateCode: "WAREHOUSE_CREATED",
      to: wh.email,
      variables: {
        warehouseName: wh.name,
        name: wh.name,
        contactName: wh.contactName || "Warehouse Manager",
      },
    });
  }
}
