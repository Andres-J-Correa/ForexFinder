import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserCreateDto } from './dto/user-create.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  private readonly logger = new Logger(UsersService.name);

  async getUserIdByEmail(email: string): Promise<number | null> {
    let userId: number | null = null;

    try {
      const user = await this.userRepo.findOne({
        where: { email },
        select: ['id'],
      });
      userId = user?.id ?? null;
    } catch (error) {
      this.logger.error('getUserIdByEmail failed.', (error as Error).stack);
      throw new InternalServerErrorException('Error fetching user by email');
    }

    return userId;
  }

  async create(model: UserCreateDto) {
    try {
      const userInstance = this.userRepo.create(model);
      const newUser = await this.userRepo.save(userInstance);
      return newUser.id;
    } catch (error) {
      this.logger.error('Creating user failed.', (error as Error).stack);
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async updateHashedRefreshToken(userId: number, hashedRefreshToken: string) {
    try {
      const { affected } = await this.userRepo.update(
        { id: userId },
        { hashedRefreshToken },
      );

      if (!affected) {
        throw new Error('No rows affected');
      }
    } catch (error) {
      this.logger.error(
        'updateHashedRefreshToken failed.',
        (error as Error).stack,
      );
      throw new InternalServerErrorException(
        'Error updating user refresh token',
      );
    }
  }

  async getHashedRefreshToken(userId: number) {
    try {
      const user = await this.userRepo.findOne({
        where: { id: userId },
        select: ['hashedRefreshToken'],
      });

      return user?.hashedRefreshToken ?? null;
    } catch (error) {
      this.logger.error(
        'getHashedRefreshToken failed.',
        (error as Error).stack,
      );
      throw new InternalServerErrorException(
        'Error fetching user refresh token',
      );
    }
  }

  async getUserById(userId: number) {
    try {
      const user = await this.userRepo.findOne({
        where: { id: userId },
        select: ['firstName', 'lastName', 'picture'],
      });

      if (!user) {
        throw new InternalServerErrorException('User not found');
      }

      return {
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.picture,
      };
    } catch (error) {
      this.logger.error('getUserById failed.', (error as Error).stack);
      throw new InternalServerErrorException('Error fetching user');
    }
  }

  async getUserWithRole(userId: number) {
    try {
      const user = await this.userRepo.findOne({
        where: { id: userId },
        select: ['id', 'role'],
      });

      return user;
    } catch (error) {
      this.logger.error('getUserWithRole failed.', (error as Error).stack);
      throw new InternalServerErrorException('Error fetching user role');
    }
  }
}
