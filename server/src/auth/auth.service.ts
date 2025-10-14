import type { AuthJwtPayload } from './types/auth-jwt-payload.types';
import type { ConfigType } from '@nestjs/config';

import {
  Injectable,
  Inject,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { UsersService } from '@/users/users.service';
import { UserCreateDto } from '@/users/dto/user-create.dto';

import jwtRefreshConfig from './config/jwt-refresh.config';

@Injectable()
export class AuthService {
  constructor(
    @Inject(jwtRefreshConfig.KEY)
    private readonly refreshConfig: ConfigType<typeof jwtRefreshConfig>,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async login(userId: number) {
    const tokens = await this.generateTokens(userId);

    let hashedRefreshToken: string;

    try {
      hashedRefreshToken = await argon2.hash(tokens.refreshToken);
    } catch (error) {
      Logger.error('Hashing refresh token failed.', (error as Error).stack);
      throw new UnauthorizedException('Failed to login');
    }

    await this.usersService.updateHashedRefreshToken(
      userId,
      hashedRefreshToken,
    );

    return tokens;
  }

  async validateGoogleUser(googleUser: UserCreateDto): Promise<number> {
    const userId = await this.usersService.getUserIdByEmail(googleUser.email);

    if (userId) return userId;

    return await this.usersService.create(googleUser);
  }

  async generateTokens(userId: number) {
    const payload: AuthJwtPayload = { sub: userId };

    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(payload),
        this.jwtService.signAsync(payload, this.refreshConfig),
      ]);

      return { accessToken, refreshToken };
    } catch (error) {
      Logger.error('generateTokens failed.', (error as Error).stack);
      throw new UnauthorizedException('Failed to generate tokens');
    }
  }

  async validateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken =
      await this.usersService.getHashedRefreshToken(userId);

    if (!hashedRefreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    let tokenMatches: boolean = false;
    try {
      tokenMatches = await argon2.verify(hashedRefreshToken, refreshToken);
    } catch (error) {
      Logger.error('validateRefreshToken failed.', (error as Error).stack);
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!tokenMatches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return true;
  }
}
