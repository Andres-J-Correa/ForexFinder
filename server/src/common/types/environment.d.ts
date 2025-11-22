declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'staging' | 'production';
    PORT: number;
    DB_TYPE: 'postgres';
    DB_HOST: string;
    DB_PORT: number;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    DB_SYNCHRONIZE: boolean;
    AUTH_JWT_SECRET: string;
    AUTH_JWT_EXPIRES_IN: string;
    AUTH_JWT_REFRESH_SECRET: string;
    AUTH_JWT_REFRESH_EXPIRES_IN: string;
    GOOGLE_OAUTH_CLIENT_ID: string;
    GOOGLE_OAUTH_SECRET: string;
    GOOGLE_OAUTH_CALLBACK_URL: string;
    LOCATION_TOKEN_SECRET: string;
    LOCATION_TOKEN_DEFAULT_EXPIRATION_DAYS: number;
  }
}
