//libs
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';

//modules
import { UsersModule } from '@/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '@/users/users.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtGuard } from './guards/jwt/jwt.guard';
import { GoogleStrategy } from './strategies/google-oauth.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { GoogleModule } from '@/google/google.module';

//config
import jwtConfig from './config/jwt.config';
import googleOauthConfig from './config/google-oauth.config';
import jwtRefreshConfig from './config/jwt-refresh.config';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(jwtRefreshConfig),
    ConfigModule.forFeature(googleOauthConfig),
    GoogleModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersService,
    JwtStrategy,
    JwtRefreshStrategy,
    GoogleStrategy,
    { provide: APP_GUARD, useClass: JwtGuard },
  ],
})
export class AuthModule {}
