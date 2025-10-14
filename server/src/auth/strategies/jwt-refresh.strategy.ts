import type { ConfigType } from '@nestjs/config';
import type { Request } from 'express';

import {
  Inject,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
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
  ): Promise<AuthJwtPayload> {
    const refreshToken = req.get('authorization')?.replace('Bearer', '').trim();

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token sent in request.');
    }

    try {
      const valid = await this.authService.validateRefreshToken(
        payload.sub,
        refreshToken,
      );

      if (!valid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;

      throw new InternalServerErrorException(error);
    }
  }
}
