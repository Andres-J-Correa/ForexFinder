import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
  Request,
  UseGuards,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';

import { RatesService } from './rates.service';
import { CreateRateDto } from './dto/create-rate.dto';
import { JwtGuard } from '@/auth/guards/jwt/jwt.guard';
import type { AuthJwtPayload } from '@/auth/types/auth-jwt-payload.types';
import { ShopsService } from '@/shops/shops.service';

interface AuthenticatedRequest extends ExpressRequest {
  user: AuthJwtPayload;
}

@Controller('shops/:shopId/rates')
@UseGuards(JwtGuard)
export class RatesController {
  constructor(
    private readonly ratesService: RatesService,
    private readonly shopsService: ShopsService,
  ) {}

  private async verifyShopOwnership(
    shopId: number,
    userId: number,
  ): Promise<void> {
    const shop = await this.shopsService.getShopById(shopId);
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }
    if (shop.ownerUserId !== userId) {
      throw new ForbiddenException('You can only manage rates for your own shop');
    }
  }

  @Post()
  async createOrUpdateRate(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Body() dto: CreateRateDto,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.verifyShopOwnership(shopId, req.user.sub);

    const rate = await this.ratesService.upsertRate(
      shopId,
      dto.fromCurrency,
      dto.toCurrency,
      dto.buyRate,
      dto.sellRate,
    );

    return {
      id: rate.id,
      shopId: rate.shopId,
      fromCurrency: rate.fromCurrency,
      toCurrency: rate.toCurrency,
      buyRate: Number(rate.buyRate),
      sellRate: Number(rate.sellRate),
      createdAt: rate.createdAt,
    };
  }

  @Get()
  async getShopRates(@Param('shopId', ParseIntPipe) shopId: number) {
    const rates = await this.ratesService.getRatesByShop(shopId);

    return rates.map((rate) => ({
      id: rate.id,
      shopId: rate.shopId,
      fromCurrency: rate.fromCurrency,
      toCurrency: rate.toCurrency,
      buyRate: Number(rate.buyRate),
      sellRate: Number(rate.sellRate),
      createdAt: rate.createdAt,
    }));
  }
}
