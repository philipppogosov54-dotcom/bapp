import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface TelegramUser {
  providerId: string;
  name: string;
  username?: string;
  avatar?: string;
}

@Injectable()
export class TelegramAuthService {
  private readonly botToken: string;
  private readonly secretKey: Buffer;

  constructor(private readonly configService: ConfigService) {
    this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN', '');
    // Create secret key from bot token
    this.secretKey = crypto.createHash('sha256').update(this.botToken).digest();
  }

  /**
   * Verify Telegram Login Widget data
   * https://core.telegram.org/widgets/login#checking-authorization
   */
  verifyTelegramAuth(authData: TelegramAuthData): TelegramUser {
    if (!this.botToken) {
      throw new UnauthorizedException('Telegram authentication not configured');
    }

    const { hash, ...data } = authData;

    // Check auth_date (allow 1 day max)
    const authDate = data.auth_date * 1000;
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 1 day

    if (now - authDate > maxAge) {
      throw new UnauthorizedException('Telegram authentication data is expired');
    }

    // Build data check string
    const dataCheckString = Object.keys(data)
      .sort()
      .map((key) => `${key}=${data[key as keyof typeof data]}`)
      .join('\n');

    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', this.secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Verify hash
    if (calculatedHash !== hash) {
      throw new UnauthorizedException('Invalid Telegram authentication data');
    }

    // Build user object
    const name = data.last_name 
      ? `${data.first_name} ${data.last_name}` 
      : data.first_name;

    return {
      providerId: String(data.id),
      name,
      username: data.username,
      avatar: data.photo_url,
    };
  }
}
