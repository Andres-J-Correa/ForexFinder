import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

import jwtConfig from '../config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import type { AuthJwtPayload } from '../types/auth-jwt-payload.types';
import { UsersService } from '@/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(jwtConfig.KEY)
    private jwtConfiguration: ConfigType<typeof jwtConfig>,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConfiguration.secret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: AuthJwtPayload) {
    // If role is already in payload (new tokens), use it
    if (payload.role) {
      return {
        sub: payload.sub,
        role: payload.role,
      };
    }

    // For backward compatibility with old tokens, fetch role from database
    const user = await this.usersService.getUserWithRole(payload.sub);
    return {
      sub: payload.sub,
      role: user?.role,
    };
  }
}
