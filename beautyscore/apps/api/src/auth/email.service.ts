import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CodeType } from '@prisma/client';

export interface EmailVerificationResult {
  codeId: string;
  expiresAt: Date;
}

export interface VerifyResult {
  email: string;
  verified: boolean;
}

@Injectable()
export class EmailService {
  private readonly CODE_LENGTH = 6;
  private readonly CODE_EXPIRY_MINUTES = 15;
  private readonly MAX_ATTEMPTS = 5;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Send email verification code
   * TODO: Integrate with SendPulse for production
   */
  async sendVerificationCode(email: string): Promise<EmailVerificationResult> {
    const normalizedEmail = email.toLowerCase();

    // Generate 6-digit code
    const code = this.generateCode();
    const codeHash = await bcrypt.hash(code, 10);

    // Set expiration
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.CODE_EXPIRY_MINUTES);

    // Save to database
    const verificationCode = await this.prisma.verificationCode.create({
      data: {
        type: CodeType.EMAIL_VERIFICATION,
        target: normalizedEmail,
        code: codeHash,
        expiresAt,
      },
    });

    // TODO: Replace with actual SendPulse integration
    // For now, log the code in development
    if (this.configService.get('NODE_ENV') !== 'production') {
      console.log(`[EMAIL] Verification code for ${normalizedEmail}: ${code}`);
    } else {
      await this.sendEmail(normalizedEmail, 'BeautyScore: Код подтверждения', `
        <h1>Подтверждение email</h1>
        <p>Ваш код подтверждения: <strong>${code}</strong></p>
        <p>Код действителен в течение ${this.CODE_EXPIRY_MINUTES} минут.</p>
      `);
    }

    return {
      codeId: verificationCode.id,
      expiresAt: verificationCode.expiresAt,
    };
  }

  /**
   * Send password reset code
   */
  async sendPasswordResetCode(email: string): Promise<EmailVerificationResult> {
    const normalizedEmail = email.toLowerCase();

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Don't reveal if user exists - always return success
    if (!user) {
      // Return fake result to prevent user enumeration
      return {
        codeId: 'fake-' + Date.now(),
        expiresAt: new Date(Date.now() + this.CODE_EXPIRY_MINUTES * 60 * 1000),
      };
    }

    // Generate code
    const code = this.generateCode();
    const codeHash = await bcrypt.hash(code, 10);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.CODE_EXPIRY_MINUTES);

    const verificationCode = await this.prisma.verificationCode.create({
      data: {
        type: CodeType.PASSWORD_RESET,
        target: normalizedEmail,
        code: codeHash,
        expiresAt,
      },
    });

    // TODO: Replace with actual SendPulse integration
    if (this.configService.get('NODE_ENV') !== 'production') {
      console.log(`[EMAIL] Password reset code for ${normalizedEmail}: ${code}`);
    } else {
      await this.sendEmail(normalizedEmail, 'BeautyScore: Сброс пароля', `
        <h1>Сброс пароля</h1>
        <p>Код для сброса пароля: <strong>${code}</strong></p>
        <p>Код действителен в течение ${this.CODE_EXPIRY_MINUTES} минут.</p>
        <p>Если вы не запрашивали сброс пароля, проигнорируйте это письмо.</p>
      `);
    }

    return {
      codeId: verificationCode.id,
      expiresAt: verificationCode.expiresAt,
    };
  }

  /**
   * Verify email code
   */
  async verifyCode(codeId: string, code: string): Promise<VerifyResult> {
    // Handle fake codeId (for user enumeration protection)
    if (codeId.startsWith('fake-')) {
      throw new BadRequestException('Неверный или просроченный код');
    }

    const verificationCode = await this.prisma.verificationCode.findUnique({
      where: { id: codeId },
    });

    if (!verificationCode) {
      throw new BadRequestException('Код не найден');
    }

    // Check if already used
    if (verificationCode.usedAt) {
      throw new BadRequestException('Код уже использован');
    }

    // Check expiration
    if (verificationCode.expiresAt < new Date()) {
      throw new BadRequestException('Код просрочен');
    }

    // Check attempts
    if (verificationCode.attempts >= this.MAX_ATTEMPTS) {
      throw new BadRequestException('Превышено количество попыток');
    }

    // Verify code
    const isValid = await bcrypt.compare(code, verificationCode.code);

    if (!isValid) {
      // Increment attempts
      await this.prisma.verificationCode.update({
        where: { id: codeId },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('Неверный код');
    }

    // Mark as used
    await this.prisma.verificationCode.update({
      where: { id: codeId },
      data: { usedAt: new Date() },
    });

    return {
      email: verificationCode.target,
      verified: true,
    };
  }

  /**
   * Generate random 6-digit code
   */
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send email via SendPulse
   * TODO: Implement actual SendPulse integration
   */
  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const sendPulseId = this.configService.get<string>('SENDPULSE_ID');
    const sendPulseSecret = this.configService.get<string>('SENDPULSE_SECRET');

    if (!sendPulseId || !sendPulseSecret) {
      console.warn('[EMAIL] SendPulse not configured, skipping email send');
      return;
    }

    // TODO: Implement SendPulse SMTP API
    // https://sendpulse.com/integrations/api/smtp
    console.log(`[EMAIL] Would send email to ${to}: ${subject}`);
  }
}
