import * as Joi from 'joi';

import { databaseTypes } from '@/common/constants/database-types';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'staging', 'production')
    .default('development'),
  PORT: Joi.number().required(),
  DB_TYPE: Joi.string()
    .valid(...databaseTypes)
    .required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_SYNCHRONIZE: Joi.number().valid(0, 1).required(),
  AUTH_JWT_SECRET: Joi.string().required(),
  AUTH_JWT_EXPIRES_IN: Joi.string().required(),
  AUTH_JWT_REFRESH_SECRET: Joi.string().required(),
  AUTH_JWT_REFRESH_EXPIRES_IN: Joi.string().required(),
  GOOGLE_OAUTH_CLIENT_ID: Joi.string().required(),
  GOOGLE_OAUTH_SECRET: Joi.string().required(),
  GOOGLE_OAUTH_CALLBACK_URL: Joi.string().required(),
});
