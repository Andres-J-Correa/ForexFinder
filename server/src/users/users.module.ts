//libs
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

//modules
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

//entities
import User from './entities/user.entity';
import UserIdentity from './entities/user-identity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserIdentity])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
