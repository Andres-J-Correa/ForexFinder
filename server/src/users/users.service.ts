import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserCreateDto } from './dto/user-create.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private UserRepo: Repository<User>) {}

  async findByEmail(email: string): Promise<User | null> {
    return await this.UserRepo.findOneBy({ email });
  }

  async create(model: UserCreateDto) {
    const user = this.UserRepo.create(model);
    return await this.UserRepo.save(user);
  }
}
