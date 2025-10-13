import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthJwtPayload } from './types/auth-jwt-payload.types';
import { UsersService } from '@/users/users.service';
import { UserCreateDto } from '@/users/dto/user-create.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async login(userId: number) {
    const payload: AuthJwtPayload = { sub: userId };
    return await this.jwtService.signAsync(payload);
  }

  async validateGoogleUser(googleUser: UserCreateDto) {
    const user = await this.usersService.findByEmail(googleUser.email);

    if (user) return user;

    return await this.usersService.create(googleUser);
  }
}
