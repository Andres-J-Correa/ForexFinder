import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LocationTokensController } from './location-tokens.controller';
import { LocationTokensService } from './location-tokens.service';
import LocationToken from './entities/location-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LocationToken])],
  controllers: [LocationTokensController],
  providers: [LocationTokensService],
  exports: [LocationTokensService],
})
export class LocationTokensModule {}

