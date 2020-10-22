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
