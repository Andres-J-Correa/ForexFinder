import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ShopsController } from './shops.controller';
import { ShopsService } from './shops.service';
import Shop from './entities/shop.entity';
import { LocationTokensModule } from '@/location-tokens/location-tokens.module';

@Module({
  imports: [TypeOrmModule.forFeature([Shop]), LocationTokensModule],
  controllers: [ShopsController],
  providers: [ShopsService],
  exports: [TypeOrmModule, ShopsService],
})
export class ShopsModule {}
