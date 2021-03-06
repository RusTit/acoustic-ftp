import log4js, { Logger } from 'log4js';
import config from './config';

log4js.configure(config.log4js);

export const LoggerFactory = (category: string): Logger =>
  log4js.getLogger(category);
