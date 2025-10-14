import type { ConfigType } from '@nestjs/config';
import type { Request } from 'express';

import { Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

import jwtRefreshConfig from '../config/jwt-refresh.config';
import { AuthJwtPayload } from '../types/auth-jwt-payload.types';
import { AuthService } from '../auth.service';

export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(
    @Inject(jwtRefreshConfig.KEY)
    private readonly refreshConfig: ConfigType<typeof jwtRefreshConfig>,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: refreshConfig.secret,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    payload: AuthJwtPayload,
  ): Promise<AuthJwtPayload | undefined> {
    const refreshToken = req.get('authorization')?.replace('Bearer', '').trim();

    let valid = false;
    if (refreshToken) {
      valid = await this.authService.validateRefreshToken(
        payload.sub,
        refreshToken,
      );
    }

    if (valid) return payload;
  }
}
