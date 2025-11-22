import {
  Injectable,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Point } from 'typeorm';

import Shop from './entities/shop.entity';
import { LocationTokensService } from '@/location-tokens/location-tokens.service';
import { NearbyShop } from './types/NearbyShop.types';
import { NearbyShopsResponse } from './types/NearbyShopsResponse';

@Injectable()
export class ShopsService {
  private readonly logger = new Logger(ShopsService.name);

  constructor(
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    private readonly locationTokensService: LocationTokensService,
  ) {}

  async createShop(
    name: string,
    latitude: number,
    longitude: number,
    ownerUserId: number,
    contact?: string,
    hours?: string,
  ): Promise<Shop> {
    try {
      // Create Point geometry for coordinates
      const coordinates: Point = {
        type: 'Point',
        coordinates: [longitude, latitude], // Note: PostGIS uses [lng, lat] order
      };

      const shop = this.shopRepository.create({
        name,
        coordinates,
        ownerUserId,
        contact: contact || null,
        hours: hours || null,
        verified: false,
      });

      const savedShop = await this.shopRepository.save(shop);
      return savedShop;
    } catch (error) {
      this.logger.error('Failed to create shop', (error as Error).stack);
      throw new InternalServerErrorException('Failed to create shop');
    }
  }

  async getShopById(id: number): Promise<Shop | null> {
    try {
      return await this.shopRepository.findOne({
        where: { id },
        relations: ['owner'],
      });
    } catch (error) {
      this.logger.error('Failed to get shop by id', (error as Error).stack);
      throw new InternalServerErrorException('Failed to fetch shop');
    }
  }

  async getShopByOwnerId(ownerUserId: number): Promise<Shop | null> {
    try {
      return await this.shopRepository.findOne({
        where: { ownerUserId },
        relations: ['owner'],
      });
    } catch (error) {
      this.logger.error(
        'Failed to get shop by owner id',
        (error as Error).stack,
      );
      throw new InternalServerErrorException('Failed to fetch shop');
    }
  }

  async getAllShopsByOwnerId(ownerUserId: number): Promise<Shop[]> {
    try {
      return await this.shopRepository.find({
        where: { ownerUserId },
        relations: ['owner'],
        order: { dateCreated: 'DESC' },
      });
    } catch (error) {
      this.logger.error(
        'Failed to get shops by owner id',
        (error as Error).stack,
      );
      throw new InternalServerErrorException('Failed to fetch shops');
    }
  }

  async updateShop(
    id: number,
    updates: Partial<Pick<Shop, 'name' | 'contact' | 'hours'>>,
  ): Promise<Shop> {
    try {
      await this.shopRepository.update({ id }, updates);
      const updatedShop = await this.getShopById(id);
      if (!updatedShop) {
        throw new BadRequestException('Shop not found');
      }
      return updatedShop;
    } catch (error) {
      this.logger.error('Failed to update shop', (error as Error).stack);
      throw new InternalServerErrorException('Failed to update shop');
    }
  }

  async registerShop(
    userId: number,
    token: string,
    shopName: string,
    contact?: string,
    hours?: string,
  ): Promise<Shop> {
    // Validate location token
    const { payload, tokenRecord } =
      await this.locationTokensService.validateToken(token);

    // Create shop at token coordinates
    const shop = await this.createShop(
      shopName,
      payload.lat,
      payload.lng,
      userId,
      contact,
      hours,
    );

    // Mark token as used
    await this.locationTokensService.markTokenAsUsed(tokenRecord.id, shop.id);

    return shop;
  }

  async isOwner(userId: number, shopId: number): Promise<boolean> {
    const shop = await this.shopRepository.findOne({
      select: ['ownerUserId'],
      where: { id: shopId },
    });
    return shop?.ownerUserId === userId;
  }

  async findNearbyShops(
    latitude: number,
    longitude: number,
    radiusKm: number,
    fromCurrency: string,
    toCurrency: string,
  ): Promise<NearbyShopsResponse[]> {
    try {
      const radiusMeters = radiusKm * 1000;
      const maxAgeDays = 7;
      const penaltyFactor = 0.5;

      // Use raw SQL query for PostGIS operations and rate ranking
      const query = `
        SELECT 
          s.id,
          s.name,
          s.contact,
          s.hours,
          ST_Y(s.coordinates::geometry) as latitude,
          ST_X(s.coordinates::geometry) as longitude,
          ST_Distance(
            s.coordinates::geography,
            ST_MakePoint($1, $2)::geography
          ) as distance,
          r.buy_rate as "buyRate",
          r.sell_rate as "sellRate",
          EXTRACT(EPOCH FROM (NOW() - r.created_at)) / 86400.0 as "rateAge",
          (r.buy_rate + (EXTRACT(EPOCH FROM (NOW() - r.created_at)) / 86400.0 * $6)) as "buyScore",
          (r.sell_rate + (EXTRACT(EPOCH FROM (NOW() - r.created_at)) / 86400.0 * $6)) as "sellScore"
        FROM shops s
        INNER JOIN rates r ON s.id = r.shop_id
        WHERE 
          ST_DWithin(
            s.coordinates::geography,
            ST_MakePoint($1, $2)::geography,
            $3
          )
          AND r.from_currency = UPPER($4)
          AND r.to_currency = UPPER($5)
          AND r.created_at > NOW() - INTERVAL '${maxAgeDays} days'
        ORDER BY "buyScore" ASC, distance ASC
        LIMIT 10
      `;

      const fromCurrencyUpper = fromCurrency.toUpperCase();
      const toCurrencyUpper = toCurrency.toUpperCase();

      const results = await this.shopRepository.query<NearbyShop[]>(query, [
        longitude,
        latitude,
        radiusMeters,
        fromCurrencyUpper,
        toCurrencyUpper,
        penaltyFactor,
      ]);

      return results.map((shop) => ({
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
          fromCurrency: fromCurrencyUpper,
          toCurrency: toCurrencyUpper,
          buyRate: parseFloat(shop.buyRate),
          sellRate: parseFloat(shop.sellRate),
          rateAge: Math.round(shop.rateAge * 10) / 10, // Round to 1 decimal
        },
      }));
    } catch (error) {
      this.logger.error('Failed to find nearby shops', (error as Error).stack);
      throw new InternalServerErrorException('Failed to search nearby shops');
    }
  }
}
