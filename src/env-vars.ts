import { dotenvProxy } from './dotenvProxy';
import * as env from 'env-var';

dotenvProxy();

export const CLIENT_ID: string = env.get('CLIENT_ID').required().asString();

export const CLIENT_SECRET: string = env
  .get('CLIENT_SECRET')
  .required()
  .asString();

export const CLIENT_REFRESH_TOKEN: string = env
  .get('CLIENT_REFRESH_TOKEN')
  .required()
  .asString();

export const URL_ENDPOINT: string = env
  .get('URL_ENDPOINT')
  .required()
  .asString();

export const RESULT_IN_HOST: string = env
  .get('RESULT_IN_HOST')
  .required()
  .asString();

export const RESULT_IN_PORT: number = env
  .get('RESULT_IN_PORT')
  .required()
  .asPortNumber();

export const RESULT_IN_USERNAME: string = env
  .get('RESULT_IN_USERNAME')
  .required()
  .asString();

export const RESULT_IN_PASSWORD: string = env
  .get('RESULT_IN_PASSWORD')
  .required()
  .asString();

export const RESULT_OUT_HOST: string = env
  .get('RESULT_OUT_HOST')
  .required()
  .asString();

export const RESULT_OUT_PORT: number = env
  .get('RESULT_OUT_PORT')
  .required()
  .asPortNumber();

export const RESULT_OUT_USERNAME: string = env
  .get('RESULT_OUT_USERNAME')
  .required()
  .asString();

export const RESULT_OUT_PASSWORD: string = env
  .get('RESULT_OUT_PASSWORD')
  .required()
  .asString();

export const RESULT_OUT_SECURE: boolean = env
  .get('RESULT_OUT_SECURE')
  .required()
  .asBool();
