import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtGuard } from './guards/jwt/jwt.guard';

import jwtConfig from './config/jwt.config';
import googleOauthConfig from './config/google-oauth.config';
import { UsersService } from '@/users/users.service';
import { GoogleGuard } from './guards/google/google.guard';
import { GoogleStrategy } from './strategies/google-oauth.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';

import User from '@/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(googleOauthConfig),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtGuard,
    UsersService,
    GoogleStrategy,
    GoogleGuard,
  ],
})
export class AuthModule {}
