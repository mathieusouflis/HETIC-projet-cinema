import { config } from "@packages/config";
import { logger } from "@packages/logger";
import FormData from "form-data";
import Mailgun from "mailgun.js";
import { ServerError } from "../../errors/server-error";
import type { IEmailService } from "./i-email-service";

export class MailgunEmailService implements IEmailService {
  async send(toEmail: string, subject: string, text: string): Promise<void> {
    const { apiKey, apiUrl, baseUrl } = config.env.mailgun;
    if (config.env.NODE_ENV === "development") {
      logger.info(
        `[MAILGUN] Email to ${toEmail} | Subject: ${subject}\n${text}`
      );
      return;
    }

    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({ username: "api", key: apiKey, url: baseUrl });

    try {
      const data = await mg.messages.create(apiUrl, {
        from: `Kirona <noreply@${apiUrl}>`,
        to: [toEmail],
        subject,
        text,
      });
      logger.info(data);
    } catch (err) {
      logger.error(err);
      throw new ServerError("Failed to send email. Please try again later.");
    }
  }
}
