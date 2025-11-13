import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

import { LocationTokensController } from './location-tokens.controller';
import { LocationTokensService } from './location-tokens.service';
import LocationToken from './entities/location-token.entity';
import locationTokenJwtConfig from './config/location-token-jwt.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([LocationToken]),
    JwtModule.registerAsync(locationTokenJwtConfig.asProvider()),
    ConfigModule.forFeature(locationTokenJwtConfig),
  ],
  controllers: [LocationTokensController],
  providers: [LocationTokensService],
  exports: [LocationTokensService],
})
export class LocationTokensModule {}

