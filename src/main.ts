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
} from './AcousticModels';

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

  // testing job id
  const jobStatusTesting = await provider.GetJobStatus(
    token,
    new GetJobStatusModel(173439829)
  );

  const getDataBases = await provider.getDatabaseList(
    token,
    new GetListDataBaseModel(1, ListTypeEnum.Databases)
  );
  const [first] = getDataBases.DatabaseList;
  const exportModel = new GetExportFromDatabaseModel([
    {
      LIST_ID: first.ID,
      EXPORT_TYPE: 'ALL',
      EXPORT_FORMAT: 'CSV',
      ADD_TO_STORED_FILES: undefined, // enough to appear in xml
    },
  ]);
  const result = await provider.runExport(token, exportModel);
  const getJobStatusModel = new GetJobStatusModel(result.JobId);
  // 173439829
  const jobStatus = await provider.GetJobStatus(token, getJobStatusModel);
};

main().catch(e => logger.error(e));
