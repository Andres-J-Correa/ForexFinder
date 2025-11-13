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

import { LocationTokensService } from './location-tokens.service';
import { GenerateLocationTokenDto } from './dto/generate-location-token.dto';
import { LocationTokenResponseDto } from './dto/location-token-response.dto';
// TODO: Import JwtAuthGuard and RolesGuard when implemented in Phase 3
// import { JwtAuthGuard } from '@/auth/guards/jwt/jwt.guard';
// import { RolesGuard } from '@/auth/guards/roles.guard';
// import { Roles } from '@/common/decorators/roles.decorator';
// import { UserRole } from '@/users/entities/user.entity';

@Controller('admin/location-tokens')
export class LocationTokensController {
  constructor(
    private readonly locationTokensService: LocationTokensService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  // TODO: Add guards in Phase 3: @UseGuards(JwtAuthGuard, RolesGuard), @Roles(UserRole.ADMIN)
  async generateToken(
    @Body() dto: GenerateLocationTokenDto,
    @Request() req: any, // TODO: Replace with proper Request type with user in Phase 3
  ): Promise<LocationTokenResponseDto> {
    // TODO: Get adminId from authenticated user in Phase 3
    // For now, using a placeholder - this will be replaced in Phase 3
    const adminId = (req.user?.sub as number) || 1;

    const expirationDays =
      dto.expirationDays ||
      Number(process.env.LOCATION_TOKEN_DEFAULT_EXPIRATION_DAYS) ||
      30;

    const { token, expiresAt } = await this.locationTokensService.generateToken(
      dto.latitude,
      dto.longitude,
      expirationDays,
      adminId,
    );

    return {
      token,
      expiresAt,
      latitude: dto.latitude,
      longitude: dto.longitude,
    };
  }

  @Get()
  // TODO: Add guards in Phase 3: @UseGuards(JwtAuthGuard, RolesGuard), @Roles(UserRole.ADMIN)
  async getAllTokens(@Request() req: any): Promise<any[]> {
    // TODO: Get adminId from authenticated user in Phase 3
    const adminId = req.user?.sub as number | undefined;

    return this.locationTokensService.getAllTokens(adminId);
  }
}
