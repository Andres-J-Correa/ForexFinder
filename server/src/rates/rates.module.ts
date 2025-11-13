import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RatesController } from './rates.controller';
import { RatesService } from './rates.service';
import Rate from './entities/rate.entity';
import { ShopsModule } from '@/shops/shops.module';

@Module({
  imports: [TypeOrmModule.forFeature([Rate]), ShopsModule],
  controllers: [RatesController],
  providers: [RatesService],
  exports: [RatesService],
})
export class RatesModule {}

