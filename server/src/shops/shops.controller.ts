import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  Request,
  ParseIntPipe,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';

import { ShopsService } from './shops.service';
import { RegisterShopDto } from './dto/register-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { NearbyShopsQueryDto } from './dto/nearby-shops-query.dto';
import { JwtGuard } from '@/auth/guards/jwt/jwt.guard';
import { Public } from '@/common/decorators/public.decorator';
import type { AuthJwtPayload } from '@/auth/types/auth-jwt-payload.types';

interface AuthenticatedRequest extends ExpressRequest {
  user: AuthJwtPayload;
}

@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Post('register')
  @UseGuards(JwtGuard)
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
        latitude: shop.coordinates.coordinates[1],
        longitude: shop.coordinates.coordinates[0],
      },
      verified: shop.verified,
      dateCreated: shop.dateCreated,
    };
  }

  @Public()
  @Get('nearby')
  async getNearbyShops(@Query() query: NearbyShopsQueryDto) {
    const radius = query.radius || 5; // Default 5km, max 20km (enforced by DTO)

    const shops = await this.shopsService.findNearbyShops(
      query.lat,
      query.lng,
      radius,
      query.fromCurrency,
      query.toCurrency,
    );

    return shops.map((shop) => ({
      id: shop.id,
      name: shop.name,
      contact: shop.contact,
      hours: shop.hours,
      coordinates: {
        latitude: shop.latitude,
        longitude: shop.longitude,
      },
      distance: Math.round(shop.distance), // in meters
      rates: {
        fromCurrency: query.fromCurrency.toUpperCase(),
        toCurrency: query.toCurrency.toUpperCase(),
        buyRate: shop.buyRate,
        sellRate: shop.sellRate,
        rateAge: Math.round(shop.rateAge * 10) / 10, // Round to 1 decimal
      },
    }));
  }

  @Get('my-shops')
  @UseGuards(JwtGuard)
  async getMyShops(@Request() req: AuthenticatedRequest) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException('User must be authenticated');
    }

    const shops = await this.shopsService.getAllShopsByOwnerId(user.sub);

    return shops.map((shop) => ({
      id: shop.id,
      name: shop.name,
      contact: shop.contact,
      hours: shop.hours,
      coordinates: {
        latitude: shop.coordinates.coordinates[1],
        longitude: shop.coordinates.coordinates[0],
      },
      verified: shop.verified,
      dateCreated: shop.dateCreated,
      dateModified: shop.dateModified,
    }));
  }

  @Get('my-shop')
  @UseGuards(JwtGuard)
  async getMyShop(@Request() req: AuthenticatedRequest) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException('User must be authenticated');
    }

    const shop = await this.shopsService.getShopByOwnerId(user.sub);

    if (!shop) {
      throw new NotFoundException('You do not own a shop');
    }

    return {
      id: shop.id,
      name: shop.name,
      contact: shop.contact,
      hours: shop.hours,
      coordinates: {
        latitude: shop.coordinates.coordinates[1],
        longitude: shop.coordinates.coordinates[0],
      },
      verified: shop.verified,
      dateCreated: shop.dateCreated,
      dateModified: shop.dateModified,
    };
  }

  @Public()
  @Get(':id')
  async getShopById(@Param('id', ParseIntPipe) id: number) {
    const shop = await this.shopsService.getShopById(id);

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    return {
      id: shop.id,
      name: shop.name,
      contact: shop.contact,
      hours: shop.hours,
      coordinates: {
        latitude: shop.coordinates.coordinates[1],
        longitude: shop.coordinates.coordinates[0],
      },
      verified: shop.verified,
      dateCreated: shop.dateCreated,
      dateModified: shop.dateModified,
    };
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  async updateShop(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateShopDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException('User must be authenticated');
    }

    // Verify shop ownership
    const shop = await this.shopsService.getShopById(id);
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }
    if (shop.ownerUserId !== user.sub) {
      throw new ForbiddenException('You can only update your own shop');
    }

    const updatedShop = await this.shopsService.updateShop(id, dto);

    return {
      id: updatedShop.id,
      name: updatedShop.name,
      contact: updatedShop.contact,
      hours: updatedShop.hours,
      coordinates: {
        latitude: updatedShop.coordinates.coordinates[1],
        longitude: updatedShop.coordinates.coordinates[0],
      },
      verified: updatedShop.verified,
      dateCreated: updatedShop.dateCreated,
      dateModified: updatedShop.dateModified,
    };
  }
}
