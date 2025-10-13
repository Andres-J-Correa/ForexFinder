import type { JwtModuleOptions } from '@nestjs/jwt';

export interface JwtConfig extends JwtModuleOptions {
  secret: string;
  signOptions: {
    expiresIn: string;
  };
}
