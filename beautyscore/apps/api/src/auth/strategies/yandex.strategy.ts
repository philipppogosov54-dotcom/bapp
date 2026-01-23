import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-yandex';
import { ConfigService } from '@nestjs/config';

/**
 * Яндекс ID API возвращает следующие данные пользователя:
 * - login, имя и фамилия, пол
 * - Портрет пользователя
 * - Email адрес
 * - Номер телефона
 * - Дата рождения
 * 
 * Документация: https://yandex.ru/dev/id/doc/ru/
 */
interface YandexProfile {
  id: string;
  username?: string;
  displayName?: string;
  name?: { 
    familyName?: string; 
    givenName?: string;
  };
  gender?: string;
  emails?: Array<{ value: string }>;
  photos?: Array<{ value: string }>;
  _json?: {
    id: string;
    login: string;
    client_id: string;
    default_email?: string;
    emails?: string[];
    default_phone?: {
      id: number;
      number: string;
    };
    psuid: string;
    default_avatar_id?: string;
    is_avatar_empty?: boolean;
    birthday?: string; // формат YYYY-MM-DD
    first_name?: string;
    last_name?: string;
    display_name?: string;
    real_name?: string;
    sex?: 'male' | 'female';
  };
}

@Injectable()
export class YandexStrategy extends PassportStrategy(Strategy, 'yandex') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('YANDEX_CLIENT_ID') || 'test',
      clientSecret: configService.get<string>('YANDEX_CLIENT_SECRET') || 'test',
      callbackURL: configService.get<string>('YANDEX_CALLBACK_URL') || 
        `${configService.get<string>('API_URL', 'http://localhost:3001')}/api/auth/yandex/callback`,
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: YandexProfile,
    done: (error: any, user?: any) => void,
  ): void {
    const { id, displayName, name, emails, photos, _json } = profile;

    // Build avatar URL from Yandex avatar ID
    let avatar = photos?.[0]?.value || null;
    if (!avatar && _json?.default_avatar_id && !_json?.is_avatar_empty) {
      avatar = `https://avatars.yandex.net/get-yapic/${_json.default_avatar_id}/islands-200`;
    }

    // Build display name (prefer real_name, then display_name, then first+last)
    const fullName = _json?.real_name || 
      _json?.display_name ||
      displayName || 
      (name ? `${name.givenName || ''} ${name.familyName || ''}`.trim() : null) ||
      (_json ? `${_json.first_name || ''} ${_json.last_name || ''}`.trim() : null);

    // Get email (prefer default_email)
    const email = _json?.default_email || emails?.[0]?.value || null;

    // Get phone number
    const phone = _json?.default_phone?.number || null;

    // Get birthday and convert to Date
    let dateOfBirth: Date | null = null;
    if (_json?.birthday) {
      const parsed = new Date(_json.birthday);
      if (!isNaN(parsed.getTime())) {
        dateOfBirth = parsed;
      }
    }

    // Map Yandex gender to our Gender enum
    let gender: 'MALE' | 'FEMALE' | null = null;
    if (_json?.sex === 'male') {
      gender = 'MALE';
    } else if (_json?.sex === 'female') {
      gender = 'FEMALE';
    }

    const user = {
      providerId: String(id),
      email,
      name: fullName || null,
      avatar,
      phone,
      dateOfBirth,
      gender,
      accessToken,
    };

    done(null, user);
  }
}
