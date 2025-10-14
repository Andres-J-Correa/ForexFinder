//libs
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';

//modules
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtGuard } from './guards/jwt/jwt.guard';
import { UsersService } from '@/users/users.service';
import { GoogleGuard } from './guards/google/google.guard';
import { GoogleStrategy } from './strategies/google-oauth.strategy';

//config
import jwtConfig from './config/jwt.config';
import googleOauthConfig from './config/google-oauth.config';
import jwtRefreshConfig from './config/jwt-refresh.config';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(jwtRefreshConfig),
    ConfigModule.forFeature(googleOauthConfig),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    { provide: APP_GUARD, useClass: JwtGuard },
    UsersService,
    GoogleStrategy,
    GoogleGuard,
  ],
})
export class AuthModule {}
