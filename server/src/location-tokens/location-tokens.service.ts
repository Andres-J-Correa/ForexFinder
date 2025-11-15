import {
  Injectable,
  Inject,
  BadRequestException,
  UnauthorizedException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';

import LocationToken from './entities/location-token.entity';
import locationTokenJwtConfig from './config/location-token-jwt.config';
import type { LocationTokenPayload } from './types/location-token-payload.types';

@Injectable()
export class LocationTokensService {
  private readonly logger = new Logger(LocationTokensService.name);

  constructor(
    @InjectRepository(LocationToken)
    private readonly locationTokenRepository: Repository<LocationToken>,
    private readonly jwtService: JwtService,
    @Inject(locationTokenJwtConfig.KEY)
    private readonly locationTokenConfig: ConfigType<
      typeof locationTokenJwtConfig
    >,
  ) {}

  async generateToken(
    latitude: number,
    longitude: number,
    adminId: number,
    expirationDays?: number,
  ): Promise<{ token: string; expiresAt: Date }> {
    
    const expirationDaysValue = expirationDays ? `${expirationDays}d` : this.locationTokenConfig.signOptions.expiresIn;
    // Generate unique ID for the token
    const uniqueId = randomUUID();

    // Create JWT payload
    const payload: LocationTokenPayload = {
      lat: latitude,
      lng: longitude,
      adminId,
      uniqueId,
    };

    // Generate JWT token
    let token: string;
    let expiresAt: Date;
    try {
      token = await this.jwtService.signAsync(payload, {
        secret: this.locationTokenConfig.secret,
        expiresIn: expirationDaysValue,
      });

      const decodedToken = await this.jwtService.decode(token);
      expiresAt = new Date(decodedToken.exp * 1000);

    } catch (error) {
      this.logger.error(
        'Failed to generate location token JWT',
        (error as Error).stack,
      );
      throw new BadRequestException('Failed to generate token');
    }

    // Hash the token for storage
    let hashedToken: string;
    try {
      hashedToken = await argon2.hash(token);
    } catch (error) {
      this.logger.error(
        'Failed to hash location token',
        (error as Error).stack,
      );
      throw new BadRequestException('Failed to process token');
    }

    // Store token record in database
    try {
      await this.locationTokenRepository.save({
        jwtHash: hashedToken,
        uniqueId,
        latitude,
        longitude,
        expiresAt,
        createdByAdminId: adminId,
        usedAt: null,
        shopId: null,
      });
    } catch (error) {
      this.logger.error(
        'Failed to save location token to database',
        (error as Error).stack,
      );
      throw new BadRequestException('Failed to save token');
    }

    return { token, expiresAt };
  }

  async validateToken(
    token: string,
  ): Promise<{ payload: LocationTokenPayload; tokenRecord: LocationToken }> {
    // Verify JWT signature and expiration
    let payload: LocationTokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<LocationTokenPayload>(
        token,
        {
          secret: this.locationTokenConfig.secret,
        },
      );
    } catch (error) {
      this.logger.warn('Invalid location token JWT', (error as Error).message);
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Find token record by uniqueId from payload
    const tokenRecord = await this.locationTokenRepository.findOne({
      where: { uniqueId: payload.uniqueId },
    });

    if (!tokenRecord) {
      throw new NotFoundException('Token not found in database');
    }

    // Verify the token hash matches (security check)
    let isValidHash: boolean;
    try {
      isValidHash = await argon2.verify(tokenRecord.jwtHash, token);
    } catch (error) {
      this.logger.warn(
        'Failed to verify token hash',
        (error as Error).message,
      );
      throw new UnauthorizedException('Token verification failed');
    }

    if (!isValidHash) {
      throw new UnauthorizedException('Token hash mismatch');
    }

    // Check if token is already used
    if (tokenRecord.usedAt) {
      throw new BadRequestException('Token has already been used');
    }

    // Check if token is expired (additional check beyond JWT exp)
    if (new Date() > tokenRecord.expiresAt) {
      throw new UnauthorizedException('Token has expired');
    }

    return { payload, tokenRecord };
  }

  async markTokenAsUsed(
    tokenRecordId: number,
    shopId: number,
  ): Promise<void> {
    try {
      await this.locationTokenRepository.update(
        { id: tokenRecordId },
        {
          usedAt: new Date(),
          shopId,
        },
      );
    } catch (error) {
      this.logger.error(
        'Failed to mark token as used',
        (error as Error).stack,
      );
      throw new BadRequestException('Failed to update token status');
    }
  }

  async getAllTokens(adminId?: number): Promise<LocationToken[]> {
    const where = adminId ? { createdByAdminId: adminId } : {};
    return this.locationTokenRepository.find({
      where,
      relations: ['shop', 'createdByAdmin'],
      order: { createdAt: 'DESC' },
    });
  }
}
