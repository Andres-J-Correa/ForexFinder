//types

//libs
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

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

    TypeOrmModule.forRootAsync(databaseConfig.asProvider()),

    // ShopsModule,

    UsersModule,

    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
