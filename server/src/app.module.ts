//types
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

//libs
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

//modules
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { ShopsModule } from './shops/shops.module';
import { UsersModule } from './users/users.module';

//config
import { envValidationSchema } from '@config/validation/env.validation';
import { AuthModule } from './auth/auth.module';
import databaseConfig from '@config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV ?? 'development'}`,
      validationSchema: envValidationSchema,
      load: [databaseConfig],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbOptions = configService.get<TypeOrmModuleOptions>('database');

        if (!dbOptions) {
          throw new Error('Database configuration not found');
        }

        return dbOptions;
      },
    }),

    // ShopsModule,

    UsersModule,

    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {
    console.log(dataSource.driver.database);
  }
}
