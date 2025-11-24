//types
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

//libs
import { registerAs } from '@nestjs/config';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: process.env.DB_TYPE,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    synchronize: process.env.DB_SYNCHRONIZE,
    autoLoadEntities: true,
  }),
);
