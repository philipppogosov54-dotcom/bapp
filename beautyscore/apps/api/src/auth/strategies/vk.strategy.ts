import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-vkontakte';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VkStrategy extends PassportStrategy(Strategy, 'vk') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('VK_APP_ID') || 'test',
      clientSecret: configService.get<string>('VK_APP_SECRET') || 'test',
      callbackURL: `${configService.get<string>('API_URL', 'http://localhost:3001')}/api/auth/vk/callback`,
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    params: any,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const { id, displayName, photos, emails } = profile;

    const user = {
      providerId: String(id),
      email: emails?.[0]?.value || params?.email || null,
      name: displayName,
      avatar: photos?.[0]?.value || null,
      accessToken,
    };

    done(null, user);
  }
}
