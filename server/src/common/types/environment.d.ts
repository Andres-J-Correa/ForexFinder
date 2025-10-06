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
  }
}
