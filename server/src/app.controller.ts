import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { AppService } from './app.service';
import { JwtGuard } from './auth/guards/jwt/jwt.guard';
import type { Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @UseGuards(JwtGuard)
  getHello(@Req() req: Request): string {
    console.log(req.user);
    return this.appService.getHello();
  }
}
