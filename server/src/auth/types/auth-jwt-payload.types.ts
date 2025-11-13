import { UserRole } from '@/users/entities/user.entity';

export interface AuthJwtPayload {
  sub: number;
  role?: UserRole;
}
