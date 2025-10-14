import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserCreateDto } from './dto/user-create.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private UserRepo: Repository<User>) {}

  async getUserIdByEmail(email: string): Promise<number | null> {
    let userId: number | null = null;

    try {
      const user = await this.UserRepo.findOne({
        where: { email },
        select: ['id'],
      });
      userId = user?.id ?? null;
    } catch (error) {
      Logger.error('getUserIdByEmail failed.', (error as Error).stack);
      throw new Error('Error fetching user by email');
    }

    return userId;
  }

  async create(model: UserCreateDto) {
    try {
      const userInstance = this.UserRepo.create(model);
      const newUser = await this.UserRepo.save(userInstance);
      return newUser.id;
    } catch (error) {
      Logger.error('Creating user failed.', (error as Error).stack);
      throw new Error('Error creating user');
    }
  }

  async updateHashedRefreshToken(userId: number, hashedRefreshToken: string) {
    try {
      const { affected } = await this.UserRepo.update(
        { id: userId },
        { hashedRefreshToken },
      );

      if (!affected) {
        throw new Error('Error updating user refresh token');
      }
    } catch (error) {
      Logger.error('updateHashedRefreshToken failed.', (error as Error).stack);
      throw new Error('Error updating user refresh token');
    }
  }

  async getHashedRefreshToken(userId: number) {
    let hashedToken: string | null = null;

    try {
      const user = await this.UserRepo.findOne({
        where: { id: userId },
        select: ['hashedRefreshToken'],
      });

      hashedToken = user?.hashedRefreshToken ?? null;
    } catch (error) {
      Logger.error('getHashedRefreshToken failed.', (error as Error).stack);
    }

    return hashedToken;
  }
}
