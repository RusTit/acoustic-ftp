import { LoggerFactory } from './logger';
import {
  CLIENT_ID,
  CLIENT_REFRESH_TOKEN,
  CLIENT_SECRET,
  URL_ENDPOINT,
} from './env-vars';
import { AcousticProvider } from './AcousticProvider';
import {
  GetListDataBaseModel,
  ListTypeEnum,
  GetExportFromDatabaseModel,
  GetJobStatusModel,
  AccessToken,
} from './AcousticModels';

const logger = LoggerFactory('src/main.ts');

logger.info('Started');

const DATABASE_NAME = 'WCA Global Database ';
const DATABASE_ID = 20718361;

const delay = async (timeout = 5000): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, timeout));

const waitForJobToFinish = async (
  provider: AcousticProvider,
  token: AccessToken,
  jobId: number
): Promise<boolean> => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const jobStatusTesting = await provider.GetJobStatus(
      token,
      new GetJobStatusModel(jobId)
    );
    switch (jobStatusTesting.JOB_STATUS) {
      case 'WAITING':
      case 'RUNNING':
        logger.debug(
          `JobId: ${jobId} is in ${jobStatusTesting.JOB_STATUS}. Waiting`
        );
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await delay();
        break;
      case 'CANCELLED':
      case 'ERROR':
        logger.warn(`Issue with: ${jobId} - ${jobStatusTesting.JOB_STATUS}`);
        return false;
      case 'COMPLETE':
        return true;
    }
  }
};

const main = async () => {
  const provider = new AcousticProvider(
    CLIENT_ID,
    CLIENT_SECRET,
    CLIENT_REFRESH_TOKEN,
    URL_ENDPOINT
  );
  const token = await provider.getAccessKey();
  logger.info(`Token: ${token}`);
  /*
  const testJobFinish = await waitForJobToFinish(provider, token, 173539596);
  debugger;*/

  /*  const getDataBases = await provider.getDatabaseList(
    token,
    new GetListDataBaseModel(1, ListTypeEnum.Databases)
  );
  const db = getDataBases.DatabaseList.find(db => db.NAME === DATABASE_NAME);
  if (!db) {
    logger.warn(`Database "${DATABASE_NAME}" is not found`);
    return;
  }*/
  const exportModel = new GetExportFromDatabaseModel([
    {
      LIST_ID: DATABASE_ID,
      EXPORT_TYPE: 'ALL',
      EXPORT_FORMAT: 'CSV',
      ADD_TO_STORED_FILES: undefined, // enough to appear in xml
    },
  ]);
  const result = await provider.runExport(token, exportModel);
  const getJobStatusModel = new GetJobStatusModel(result.JobId);

  await waitForJobToFinish(provider, token, getJobStatusModel.JOB_ID);
};

main().catch(e => logger.error(e));
