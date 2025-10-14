import type { ConfigType } from '@nestjs/config';
import type { Profile } from 'passport-google-oauth20';

import {
  HttpException,
  Inject,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import googleOauthConfig from '../config/google-oauth.config';
import { AuthService } from '../auth.service';

export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(googleOauthConfig.KEY)
    private googleConfiguration: ConfigType<typeof googleOauthConfig>,
    private authService: AuthService,
  ) {
    super({
      clientID: googleConfiguration.clientId,
      clientSecret: googleConfiguration.clientSecret,
      callbackURL: googleConfiguration.callbackUrl,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    try {
      const userId = await this.authService.validateGoogleUser({
        firstName: profile._json.given_name!,
        lastName: profile._json.family_name!,
        email: profile._json.email!,
        picture: profile._json.picture,
      });

      return userId;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      Logger.error('validateGoogleUser failed.', (error as Error).stack);

      throw new InternalServerErrorException('Failed to validate Google user');
    }
  }
}
