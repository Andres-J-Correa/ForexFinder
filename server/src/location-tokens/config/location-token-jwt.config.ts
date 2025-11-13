import { registerAs } from '@nestjs/config';

import type { JwtConfig } from '@/auth/types/jwt-config.types';

export default registerAs(
  'locationTokenJwt',
  (): JwtConfig => ({
    secret: process.env.LOCATION_TOKEN_SECRET,
    signOptions: {
      expiresIn: process.env.LOCATION_TOKEN_DEFAULT_EXPIRATION_DAYS
        ? `${process.env.LOCATION_TOKEN_DEFAULT_EXPIRATION_DAYS}d`
        : '30d',
    },
  }),
);

