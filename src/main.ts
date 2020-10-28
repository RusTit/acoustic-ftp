import { LoggerFactory } from './logger';
import moment from 'moment';
import {
  CLIENT_ID,
  CLIENT_REFRESH_TOKEN,
  CLIENT_SECRET,
  URL_ENDPOINT,
  RESULT_IN_HOST,
  RESULT_IN_PORT,
  RESULT_IN_USERNAME,
  RESULT_IN_PASSWORD,
  RESULT_OUT_HOST,
  RESULT_OUT_PORT,
  RESULT_OUT_SECURE,
  RESULT_OUT_USERNAME,
  RESULT_OUT_PASSWORD,
} from './env-vars';
import { AcousticProvider } from './AcousticProvider';
import {
  GetExportFromDatabaseModel,
  GetJobStatusModel,
  AccessToken,
  convertTimestampToStr,
} from './AcousticModels';
import Client, { ConnectOptions } from 'ssh2-sftp-client';
import { Client as ftpClient } from 'basic-ftp';
import { Readable } from 'stream';

const logger = LoggerFactory('src/main.ts');

logger.info('Started');

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
        logger.info(`Job: ${jobId} is completed.`);
        return true;
    }
  }
};

async function getResultFromSFtp(path: string): Promise<Buffer> {
  const sftpClient = new Client();
  const config: ConnectOptions = {
    host: RESULT_IN_HOST,
    port: RESULT_IN_PORT,
    username: RESULT_IN_USERNAME,
    password: RESULT_IN_PASSWORD,
  };
  logger.debug('Starting sftp connection');
  await sftpClient.connect(config);
  logger.debug(`SFTP connection established, downloading file: (${path})`);
  const data = await sftpClient.get(path);
  await sftpClient.end();
  logger.info(`File is downloaded from the sftp: (${path})`);
  if (typeof data === 'string') {
    return Buffer.from(data);
  }
  if (Buffer.isBuffer(data)) {
    return data;
  }
  throw new Error('Invalid sftp usage.');
}

async function putResultToFtp(buffer: Buffer, fileName: string): Promise<void> {
  const client = new ftpClient();
  // client.ftp.verbose = true;
  logger.debug('Starting ftp connection');
  await client.access({
    host: RESULT_OUT_HOST,
    port: RESULT_OUT_PORT,
    user: RESULT_OUT_USERNAME,
    password: RESULT_OUT_PASSWORD,
    secure: RESULT_OUT_SECURE,
    secureOptions: {
      rejectUnauthorized: false,
    },
  });
  const readableStream = new Readable({
    read() {
      this.push(buffer);
      this.push(null);
    },
  });
  const finalPath = `/acoustic/${fileName}`;
  logger.debug(`Starting upload task to ftp destination (${finalPath})`);
  await client.uploadFrom(readableStream, finalPath);
  logger.info(`Upload task to ftp server is finished. (${finalPath})`);
  await client.close();
}

function getCleanFilenameFromPath(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1];
}

const main = async () => {
  const provider = new AcousticProvider(
    CLIENT_ID,
    CLIENT_SECRET,
    CLIENT_REFRESH_TOKEN,
    URL_ENDPOINT
  );
  const token = await provider.getAccessKey();
  logger.info(`Token: ${token}`);

  const mondayOfPrevWeek = moment().day(-6).startOf('day');
  const sundayOfPrevWeek = moment().day(0).endOf('day');
  const exportModel = new GetExportFromDatabaseModel([
    {
      LIST_ID: DATABASE_ID,
      EXPORT_TYPE: 'ALL',
      EXPORT_FORMAT: 'CSV',
      ADD_TO_STORED_FILES: undefined, // enough to appear in xml
      DATE_START: convertTimestampToStr(mondayOfPrevWeek),
      DATE_END: convertTimestampToStr(sundayOfPrevWeek),
    },
  ]);
  logger.debug('Starting export task.');
  const exportResponseModel = await provider.runExport(token, exportModel);
  logger.info(
    `Export job is started successfully. JobId: ${exportResponseModel.JobId}, filepath: ${exportResponseModel.FilePath}`
  );
  const getJobStatusModel = new GetJobStatusModel(exportResponseModel.JobId);
  logger.debug('Waiting until job finished successfully or with error');
  if (await waitForJobToFinish(provider, token, getJobStatusModel.JOB_ID)) {
    const resultBuffer = await getResultFromSFtp(exportResponseModel.FilePath);
    await putResultToFtp(
      resultBuffer,
      getCleanFilenameFromPath(exportResponseModel.FilePath)
    );
  }
};

function cronEntryPoint() {
  main()
    .catch(e => logger.error(e))
    .finally(() => logger.info('Main is finished'));
}

cronEntryPoint();
