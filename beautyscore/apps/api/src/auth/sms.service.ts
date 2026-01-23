import { Injectable, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

export interface SendSmsResult {
  codeId: string;
  expiresAt: Date;
}

export interface VerifySmsResult {
  success: boolean;
  phone: string;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly smsProvider: string;
  private readonly smsApiKey: string;
  private readonly smsSenderName: string;
  private readonly mockMode: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.smsProvider = this.configService.get<string>('SMS_PROVIDER', 'mock');
    this.smsApiKey = this.configService.get<string>('SMS_API_KEY', '');
    this.smsSenderName = this.configService.get<string>('SMS_SENDER_NAME', 'BeautyScore');
    this.mockMode = this.smsProvider === 'mock' || this.configService.get<string>('SMS_MOCK_MODE') === 'true';
  }

  /**
   * Validate Russian phone number format
   */
  private validatePhoneNumber(phone: string): string {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Russian phone: starts with 7 or 8, 11 digits total
    if (cleaned.length === 11 && (cleaned.startsWith('7') || cleaned.startsWith('8'))) {
      // Normalize to +7 format
      return '+7' + cleaned.slice(1);
    }
    
    // Already in +7 format (10 digits after +7)
    if (cleaned.length === 10) {
      return '+7' + cleaned;
    }
    
    throw new BadRequestException('Неверный формат номера телефона. Используйте российский номер (+7...)');
  }

  /**
   * Generate 6-digit verification code
   */
  private generateCode(): string {
    if (this.mockMode) {
      return '123456';
    }
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Send SMS via provider
   */
  private async sendSmsViaProvider(phone: string, message: string): Promise<boolean> {
    if (this.mockMode) {
      this.logger.log(`[MOCK SMS] To: ${phone}, Message: ${message}`);
      return true;
    }

    try {
      switch (this.smsProvider) {
        case 'sms_ru':
          return await this.sendViaSmsRu(phone, message);
        case 'smsc_ru':
          return await this.sendViaSmsc(phone, message);
        default:
          this.logger.warn(`Unknown SMS provider: ${this.smsProvider}, using mock mode`);
          this.logger.log(`[MOCK SMS] To: ${phone}, Message: ${message}`);
          return true;
      }
    } catch (error) {
      this.logger.error(`Failed to send SMS: ${error.message}`);
      throw new BadRequestException('Не удалось отправить SMS. Попробуйте позже.');
    }
  }

  /**
   * Send via SMS.RU
   */
  private async sendViaSmsRu(phone: string, message: string): Promise<boolean> {
    const url = new URL('https://sms.ru/sms/send');
    url.searchParams.append('api_id', this.smsApiKey);
    url.searchParams.append('to', phone.replace('+', ''));
    url.searchParams.append('msg', message);
    url.searchParams.append('json', '1');
    
    if (this.smsSenderName) {
      url.searchParams.append('from', this.smsSenderName);
    }

    const response = await fetch(url.toString());
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`SMS.RU error: ${data.status_text || 'Unknown error'}`);
    }
    
    return true;
  }

  /**
   * Send via SMSC.RU
   */
  private async sendViaSmsc(phone: string, message: string): Promise<boolean> {
    const [login, password] = this.smsApiKey.split(':');
    
    const url = new URL('https://smsc.ru/sys/send.php');
    url.searchParams.append('login', login);
    url.searchParams.append('psw', password);
    url.searchParams.append('phones', phone.replace('+', ''));
    url.searchParams.append('mes', message);
    url.searchParams.append('fmt', '3'); // JSON response
    
    if (this.smsSenderName) {
      url.searchParams.append('sender', this.smsSenderName);
    }

    const response = await fetch(url.toString());
    const data = await response.json();
    
    if (data.error) {
      throw new Error(`SMSC.RU error: ${data.error}`);
    }
    
    return true;
  }

  /**
   * Send verification code to phone
   */
  async sendVerificationCode(phone: string): Promise<SendSmsResult> {
    const normalizedPhone = this.validatePhoneNumber(phone);
    
    // Check rate limit - max 3 codes per phone per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCodes = await this.prisma.verificationCode.count({
      where: {
        target: normalizedPhone,
        type: 'PHONE_VERIFICATION',
        createdAt: { gte: oneHourAgo },
      },
    });
    
    if (recentCodes >= 3) {
      throw new BadRequestException('Превышен лимит отправки кодов. Попробуйте через час.');
    }
    
    // Generate code
    const code = this.generateCode();
    const hashedCode = await bcrypt.hash(code, 10);
    
    // Save to database
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    const verificationCode = await this.prisma.verificationCode.create({
      data: {
        type: 'PHONE_VERIFICATION',
        target: normalizedPhone,
        code: hashedCode,
        expiresAt,
      },
    });
    
    // Send SMS
    const message = `BeautyScore: ваш код подтверждения ${code}. Код действителен 5 минут.`;
    await this.sendSmsViaProvider(normalizedPhone, message);
    
    this.logger.log(`Verification code sent to ${normalizedPhone.slice(0, -4)}****`);
    
    return {
      codeId: verificationCode.id,
      expiresAt,
    };
  }

  /**
   * Verify code
   */
  async verifyCode(codeId: string, code: string): Promise<VerifySmsResult> {
    const verificationCode = await this.prisma.verificationCode.findUnique({
      where: { id: codeId },
    });
    
    if (!verificationCode) {
      throw new UnauthorizedException('Код не найден. Запросите новый код.');
    }
    
    // Check if already used
    if (verificationCode.usedAt) {
      throw new UnauthorizedException('Код уже использован. Запросите новый код.');
    }
    
    // Check if expired
    if (verificationCode.expiresAt < new Date()) {
      throw new UnauthorizedException('Код истек. Запросите новый код.');
    }
    
    // Check attempts
    if (verificationCode.attempts >= 3) {
      throw new UnauthorizedException('Превышено количество попыток. Запросите новый код.');
    }
    
    // Increment attempts
    await this.prisma.verificationCode.update({
      where: { id: codeId },
      data: { attempts: { increment: 1 } },
    });
    
    // Verify code
    const isValid = await bcrypt.compare(code, verificationCode.code);
    
    if (!isValid) {
      const remainingAttempts = 2 - verificationCode.attempts;
      throw new UnauthorizedException(
        remainingAttempts > 0 
          ? `Неверный код. Осталось попыток: ${remainingAttempts}`
          : 'Неверный код. Запросите новый код.'
      );
    }
    
    // Mark as used
    await this.prisma.verificationCode.update({
      where: { id: codeId },
      data: { usedAt: new Date() },
    });
    
    return {
      success: true,
      phone: verificationCode.target,
    };
  }
}
