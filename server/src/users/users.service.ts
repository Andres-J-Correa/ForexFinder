import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserCreateDto } from './dto/user-create.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private UserRepo: Repository<User>) {}

  async getUserIdByEmail(email: string): Promise<number> {
    const user = await this.UserRepo.findOne({
      where: { email },
      select: ['id'],
    });

    const userId = user?.id ?? 0;

    return userId;
  }

  async create(model: UserCreateDto) {
    const userInstance = this.UserRepo.create(model);
    const newUser = await this.UserRepo.save(userInstance);
    return newUser.id;
  }

  async updateHashedRefreshToken(userId: number, hashedRefreshToken: string) {
    const { affected } = await this.UserRepo.update(
      { id: userId },
      { hashedRefreshToken },
    );

    if (!affected) {
      throw new Error('Error updating user refresh token');
    }
  }

  async getHashedRefreshToken(userId: number) {
    const user = await this.UserRepo.findOne({
      where: { id: userId },
      select: ['hashedRefreshToken'],
    });

    return user?.hashedRefreshToken;
  }
}
