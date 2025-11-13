import {
  Injectable,
  BadRequestException,
  Logger,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import Rate from './entities/rate.entity';

@Injectable()
export class RatesService {
  private readonly logger = new Logger(RatesService.name);

  constructor(
    @InjectRepository(Rate)
    private readonly rateRepository: Repository<Rate>,
  ) {}

  async upsertRate(
    shopId: number,
    fromCurrency: string,
    toCurrency: string,
    buyRate: number,
    sellRate: number,
  ): Promise<Rate> {
    try {
      // Check if rate already exists
      const existingRate = await this.rateRepository.findOne({
        where: {
          shopId,
          fromCurrency: fromCurrency.toUpperCase(),
          toCurrency: toCurrency.toUpperCase(),
        },
      });

      if (existingRate) {
        // Update existing rate (replace old one)
        existingRate.buyRate = buyRate;
        existingRate.sellRate = sellRate;
        existingRate.createdAt = new Date(); // Update timestamp
        return await this.rateRepository.save(existingRate);
      } else {
        // Create new rate
        const newRate = this.rateRepository.create({
          shopId,
          fromCurrency: fromCurrency.toUpperCase(),
          toCurrency: toCurrency.toUpperCase(),
          buyRate,
          sellRate,
        });
        return await this.rateRepository.save(newRate);
      }
    } catch (error) {
      this.logger.error('Failed to upsert rate', (error as Error).stack);
      throw new InternalServerErrorException('Failed to save rate');
    }
  }

  async getRatesByShop(shopId: number): Promise<Rate[]> {
    try {
      return await this.rateRepository.find({
        where: { shopId },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error('Failed to get rates by shop', (error as Error).stack);
      throw new InternalServerErrorException('Failed to fetch rates');
    }
  }

  async getRateByShopAndCurrency(
    shopId: number,
    fromCurrency: string,
    toCurrency: string,
  ): Promise<Rate | null> {
    try {
      return await this.rateRepository.findOne({
        where: {
          shopId,
          fromCurrency: fromCurrency.toUpperCase(),
          toCurrency: toCurrency.toUpperCase(),
        },
      });
    } catch (error) {
      this.logger.error(
        'Failed to get rate by shop and currency',
        (error as Error).stack,
      );
      throw new InternalServerErrorException('Failed to fetch rate');
    }
  }

  async deleteRate(rateId: number, shopId: number): Promise<void> {
    try {
      const result = await this.rateRepository.delete({
        id: rateId,
        shopId,
      });

      if (result.affected === 0) {
        throw new NotFoundException('Rate not found');
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to delete rate', (error as Error).stack);
      throw new InternalServerErrorException('Failed to delete rate');
    }
  }
}
