import type { Request } from 'express';

import {
  Controller,
  Get,
  UseGuards,
  Req,
  Post,
  UnauthorizedException,
  Body,
} from '@nestjs/common';

import { Public } from '@/common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { GoogleGuard } from './guards/google/google.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh/jwt-refresh.guard';
import { AuthJwtPayload } from './types/auth-jwt-payload.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@Req() req: Request) {
    const user = req.user as AuthJwtPayload | undefined;

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return await this.authService.login(user.sub);
  }

  @Public()
  @UseGuards(GoogleGuard)
  @Get('google/login')
  googleLogin() {}

  @Public()
  @UseGuards(GoogleGuard)
  @Get('google/callback')
  async googleCallback(@Req() req: Request) {
    const userId: number = req.user as number;
    return await this.authService.login(userId);
  }

  @Public()
  @Post('login')
  login(@Body('idToken') idToken: string) {
    console.log(idToken);
  }
}
