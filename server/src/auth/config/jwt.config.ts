import { registerAs } from '@nestjs/config';

import type { JwtConfig } from '../types/jwt-config.types';

export default registerAs(
  'jwt',
  (): JwtConfig => ({
    secret: process.env.AUTH_JWT_SECRET,
    expiresIn: process.env.AUTH_JWT_EXPIRES_IN,
  }),
);
