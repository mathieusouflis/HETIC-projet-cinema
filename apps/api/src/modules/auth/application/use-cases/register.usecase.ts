import { config } from "@packages/config";
import type { IEmailService } from "../../../../shared/services/email/i-email-service.js";
import type { IPasswordService } from "../../../../shared/services/password/i-password-service.js";
import {
  generateSecureToken,
  getExpiryDate,
  hashToken,
} from "../../../../shared/utils/crypto.utils.js";
import { EmailAlreadyExistsError } from "../../../users/domain/errors/EmailAlreadyExistsError.js";
import { UsernameAlreadyExistsError } from "../../../users/domain/errors/UsernameAlreadyExistsError.js";
import type { IUserRepository } from "../../../users/domain/interfaces/IUserRepository.js";
import { EMAIL_VERIFICATION_TOKEN_EXPIRY_MS } from "../../domain/constants.js";
import type { IEmailVerificationTokenRepository } from "../../domain/interfaces/IEmailVerificationTokenRepository.js";
import type { RegisterDTO } from "../dto/request/register.dto.js";

/**
 * Register Use Case
 *
 * Handles user registration business logic.
 * After registration, sends a verification email instead of logging in immediately.
 */
export class RegisterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: IPasswordService,
    private readonly emailVerificationTokenRepository: IEmailVerificationTokenRepository,
    private readonly emailService: IEmailService
  ) {}

  /**
   * @param data - Registration data (email, username, password)
   * @returns Promise resolving to void — user must verify email before login
   * @throws EmailAlreadyExistsError if email is already registered and verified
   * @throws UsernameAlreadyExistsError if username is already taken
   */
  async execute(data: RegisterDTO): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(data.email);

    if (existingUser?.isEmailVerified()) {
      throw new EmailAlreadyExistsError(data.email);
    }

    const usernameExists = await this.userRepository.existsByUsername(
      data.username
    );

    if (usernameExists) {
      throw new UsernameAlreadyExistsError(data.username);
    }

    if (existingUser && !existingUser.isEmailVerified()) {
      await this.userRepository.delete(existingUser.id);
    }

    const passwordHash = await this.passwordService.hash(data.password);

    const user = await this.userRepository.create({
      email: data.email,
      username: data.username,
      passwordHash,
    });

    const rawToken = generateSecureToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = getExpiryDate(EMAIL_VERIFICATION_TOKEN_EXPIRY_MS);

    await this.emailVerificationTokenRepository.create(
      user.id,
      tokenHash,
      expiresAt
    );

    const verificationUrl = `${config.env.frontend.url}/verify-email?token=${rawToken}`;

    await this.emailService.send(
      user.email,
      "Verify your email address",
      `Welcome to Kirona! Click the link below to verify your email address (expires in 15 minutes):\n\n${verificationUrl}\n\nIf you did not create an account, please ignore this email.`
    );
  }
}
