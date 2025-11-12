import googleOauthConfig from '@/auth/config/google-oauth.config';
import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';


@Global()
@Module({
  imports: [
    ConfigModule.forFeature(googleOauthConfig),
  ],
  providers: [
    { provide: OAuth2Client,
        inject: [googleOauthConfig.KEY],
        useFactory: (config: ConfigType<typeof googleOauthConfig>): OAuth2Client =>
            new OAuth2Client({
                clientId: config.clientId,
                clientSecret: config.clientSecret,
                redirectUri: config.callbackUrl,
            }),
    },
  ],
  exports: [OAuth2Client],
})
export class GoogleModule {}
