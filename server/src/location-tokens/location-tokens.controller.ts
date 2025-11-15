import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';

import { LocationTokensService } from './location-tokens.service';
import { GenerateLocationTokenDto } from './dto/generate-location-token.dto';
import { LocationTokenResponseDto } from './dto/location-token-response.dto';
import { JwtGuard } from '@/auth/guards/jwt/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/users/entities/user.entity';
import type { AuthJwtPayload } from '@/auth/types/auth-jwt-payload.types';

interface AuthenticatedRequest extends ExpressRequest {
  user: AuthJwtPayload;
}

@Controller('admin/location-tokens')
@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class LocationTokensController {
  constructor(
    private readonly locationTokensService: LocationTokensService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async generateToken(
    @Body() dto: GenerateLocationTokenDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<LocationTokenResponseDto> {
    const adminId = req.user.sub;

    const { token, expiresAt } = await this.locationTokensService.generateToken(
      dto.latitude,
      dto.longitude,
      adminId,
      dto.expirationDays
    );

    return {
      token,
      expiresAt,
      latitude: dto.latitude,
      longitude: dto.longitude,
    };
  }

  @Get()
  async getAllTokens(
    @Request() req: AuthenticatedRequest,
  ): Promise<any[]> {
    const adminId = req.user.sub;

    return this.locationTokensService.getAllTokens(adminId);
  }
}
