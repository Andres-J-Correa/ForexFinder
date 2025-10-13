import type { GoogleOAuthConfig } from '../types/google-oauth-config.types';

import { registerAs } from '@nestjs/config';

export default registerAs(
  'googleOAuth',
  (): GoogleOAuthConfig => ({
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_OAUTH_SECRET,
    callbackUrl: process.env.GOOGLE_OAUTH_CALLBACK_URL,
  }),
);
