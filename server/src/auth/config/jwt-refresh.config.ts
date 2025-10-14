import type { JwtRefreshConfig } from '../types/jwt-refresh-config.types';

import { registerAs } from '@nestjs/config';

import { jwtRefreshKey } from '../common/constants';

export default registerAs(
  jwtRefreshKey,
  (): JwtRefreshConfig => ({
    secret: process.env.AUTH_JWT_REFRESH_SECRET,
    expiresIn: process.env.AUTH_JWT_REFRESH_EXPIRES_IN,
  }),
);
