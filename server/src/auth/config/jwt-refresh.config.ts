import type { JwtRefreshConfig } from '../types/jwt-refresh-config.types';

import { registerAs } from '@nestjs/config';

export default registerAs(
  'jwt-refresh',
  (): JwtRefreshConfig => ({
    secret: process.env.AUTH_JWT_REFRESH_SECRET,
    expiresIn: process.env.AUTH_JWT_REFRESH_EXPIRES_IN,
  }),
);
