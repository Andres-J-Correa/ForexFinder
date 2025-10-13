//libs
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

//modules
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

//entities
import User from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
