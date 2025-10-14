import type { JwtSignOptions } from '@nestjs/jwt';

export interface JwtRefreshConfig extends JwtSignOptions {
  secret: string;
  expiresIn: string;
}
