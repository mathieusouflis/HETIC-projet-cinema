import { config } from "@packages/config";
import { logger } from "@packages/logger";
import FormData from "form-data";
import Mailgun from "mailgun.js";
import { ServerError } from "../../errors/server-error.js";
import type { IEmailService } from "./i-email-service.js";

export class MailgunEmailService implements IEmailService {
  async sendPasswordResetEmail(
    toEmail: string,
    resetUrl: string
  ): Promise<void> {
    const { apiKey, apiUrl, baseUrl } = config.env.mailgun;
    if (config.env.NODE_ENV === "development") {
      logger.info(
        `[MAILGUN] Password reset email to ${toEmail}. Reset URL: ${resetUrl}`
      );
      return;
    }

    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({ username: "api", key: apiKey, url: baseUrl });

    try {
      const data = await mg.messages.create(apiUrl, {
        from: `Kirona <noreply@${apiUrl}>`,
        to: [toEmail],
        subject: "Reset your password",
        text: `You requested a password reset. Click the link below to reset your password (expires in 1 hour):\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
      });
      logger.info(data);
    } catch (err) {
      logger.error(err);
      throw new ServerError(`Mailgun error: ${err}`);
    }
  }
}
