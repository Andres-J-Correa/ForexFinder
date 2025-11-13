import {
  Controller,
  Post,
  Body,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';

import { ShopsService } from './shops.service';
import { RegisterShopDto } from './dto/register-shop.dto';
import type { AuthJwtPayload } from '@/auth/types/auth-jwt-payload.types';

interface AuthenticatedRequest extends ExpressRequest {
  user: AuthJwtPayload;
}

@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Post('register')
  async registerShop(
    @Body() dto: RegisterShopDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException(
        'User must be authenticated to register a shop',
      );
    }

    const shop = await this.shopsService.registerShop(
      user.sub,
      dto.token,
      dto.shopName,
      dto.contact,
      dto.hours,
    );

    return {
      id: shop.id,
      name: shop.name,
      contact: shop.contact,
      hours: shop.hours,
      coordinates: {
        latitude: (shop.coordinates as any).coordinates[1],
        longitude: (shop.coordinates as any).coordinates[0],
      },
      verified: shop.verified,
      dateCreated: shop.dateCreated,
    };
  }
}
