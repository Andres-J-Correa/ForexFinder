import type { Request } from 'express';

import { Controller, Get, UseGuards, Req } from '@nestjs/common';

import { AuthService } from './auth.service';
import { GoogleGuard } from './guards/google/google.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(GoogleGuard)
  @Get('google/login')
  googleLogin() {}

  @UseGuards(GoogleGuard)
  @Get('google/callback')
  async googleCallback(@Req() req: Request) {
    const user: { id: number } = req.user as { id: number };
    return await this.authService.login(user.id);
  }
}
