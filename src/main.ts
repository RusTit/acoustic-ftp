import { LoggerFactory } from './logger';
import {
  CLIENT_ID,
  CLIENT_REFRESH_TOKEN,
  CLIENT_SECRET,
  URL_ENDPOINT,
} from './env-vars';
import { AcousticProvider } from './AcousticProvider';

const logger = LoggerFactory('src/main.ts');

logger.info('Started');

const main = async () => {
  const provider = new AcousticProvider(
    CLIENT_ID,
    CLIENT_SECRET,
    CLIENT_REFRESH_TOKEN,
    URL_ENDPOINT
  );
  const token = await provider.getAccessKey();
  logger.info(`Token: ${token}`);
};

main().catch(e => logger.error(e));
