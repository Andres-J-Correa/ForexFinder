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
    await this.locationTokensService.markTokenAsUsed(
      tokenRecord.id,
      shop.id,
    );

    return shop;
  }
}
