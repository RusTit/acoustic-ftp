import {
  AccessToken,
  ExportResponseModel,
  GetExportFromDatabaseModel,
  GetJobStatusModel,
  GetListDataBaseModel,
  JobStatusResponseModel,
  ListDataBaseResponseModel,
  ListTypeEnum,
  VisibilityEnum,
} from '../src/AcousticModels';
import * as path from 'path';
import * as fs from 'fs/promises';

export enum ExampleType {
  Request,
  Response
}

export async function LoadExample(name: string, type: ExampleType): Promise<string> {
  const xmlName = `${name}.xml`;
  let exampleDirectory;
  switch (type) {
    case ExampleType.Request:
      exampleDirectory = 'requests';
      break;
    case ExampleType.Response:
      exampleDirectory = 'responses';
      break;
    default:
      throw new Error('Unhandled enum case');
  }
  const fullPath = path.resolve(__dirname, 'examples', exampleDirectory, xmlName);
  const content = await fs.readFile(fullPath, 'utf-8');
  return content.trimEnd(); // remove new line created by ide.
}
/**
 * Two minutenames for jest test case.
 */
const LONG_ASYNC_DELAY = 120000;

describe('model tests', () => {
  beforeEach(() => {
    jest.setTimeout(LONG_ASYNC_DELAY);
  });
  it('check VisibilityEnum values', () => {
    expect(VisibilityEnum.Private).toBe(0);
    expect(VisibilityEnum.Shared).toBe(1);
  });
  it('check ListTypeEnum values', () => {
    expect(ListTypeEnum.Databases).toBe(0);
    expect(ListTypeEnum.Queries).toBe(1);
    expect(ListTypeEnum.DatabasesContactListsQueries).toBe(2);
    expect(ListTypeEnum.TestLists).toBe(5);
    expect(ListTypeEnum.SeedLists).toBe(6);
    expect(ListTypeEnum.SuppressionLists).toBe(13);
    expect(ListTypeEnum.RelationalTables).toBe(15);
    expect(ListTypeEnum.ContactLists).toBe(18);
  });
  it('check GetExportFromDatabaseModel xml string', async () => {
    const model = new GetExportFromDatabaseModel([{
      LIST_ID: 40462047,
      EXPORT_TYPE: 'ALL',
      EXPORT_FORMAT: 'CSV',
    }]);
    const strResult = model.getXmlModel();
    const testCase = await LoadExample('get_export_from_database', ExampleType.Request);
    expect(strResult).toBe(testCase);
  });
  it('check GetJobStatusModel xml string', async  () => {
    const model = new GetJobStatusModel(123);
    const strResult = model.getXmlModel();
    const testCase = await LoadExample('get_job_status', ExampleType.Request);
    expect(strResult).toBe(testCase);
  });
  it('check GetListDataBaseModel xml string', async () => {
    const model = new GetListDataBaseModel(VisibilityEnum.Shared, ListTypeEnum.Databases);
    const strResult = model.getXmlModel();
    const testCase = await LoadExample('get_list_databases', ExampleType.Request);
    expect(strResult).toBe(testCase);
  });
  it('check ListDataBaseResponseModel parsing', async () => {
    const rawXml = await LoadExample('list_databases_response', ExampleType.Response);
    const result = await ListDataBaseResponseModel.Parse(rawXml);
    expect(result.DatabaseList.length).toBe(6);
    const [first] = result.DatabaseList;
    expect(first.ID).toBe(16529017);
    expect(first.NAME).toBe('Archive');
    expect(first.TYPE).toBe(0);
    expect(first.SIZE).toBe(0);
    expect(first.NUM_OPT_OUTS).toBe(0);
    expect(first.NUM_UNDELIVERABLE).toBe(0);
    expect(first.LAST_MODIFIED).toBe('06/01/16 11:18 AM');
    expect(first.VISIBILITY).toBe(VisibilityEnum.Shared);
    expect(first.PARENT_NAME).toBe('');
    expect(first.USER_ID).toBe('161cf73-12b9c2ce7d3-4f4749e15ce6d7a21b02ab08b9b7921c');
    expect(first.PARENT_FOLDER_ID).toBe(6849213);
    expect(first.IS_FOLDER).toBe(true);
    expect(first.FLAGGED_FOR_BACKUP).toBe(false);
    expect(first.SUPPRESSION_LIST_ID).toBe(0);
    expect(first.IS_DATABASE_TEMPLATE).toBe(false);
  });
  it('check access token object fields', async () => {
    const access_token = 'access_token-abcd';
    const token_type = 'token_type-abcd';
    const refresh_token = 'refresh_token-abcd';
    const expire_in = 1;
    const accessToken = new AccessToken(access_token, token_type, refresh_token, expire_in);
    expect(accessToken.isOutDated()).toBe(false);
    expect(accessToken.access_token).toBe(access_token);
    expect(accessToken.token_type).toBe(token_type);
    expect(accessToken.refresh_token).toBe(refresh_token);
    expect(accessToken.expires_in).toBe(expire_in);
    await (new Promise(resolve => setTimeout(resolve, 2000)));
    expect(accessToken.isOutDated()).toBe(true);
  });
  it('check ExportResponseModel parsing', async () => {
    const rawXml = await LoadExample('export_result_response', ExampleType.Response);
    const result = await ExportResponseModel.Parse(rawXml);
    expect(result.JobId).toBe(173476817);
    expect(result.FilePath).toBe('/download/Copy of WCA Global Database  10.15.2020 - All - Oct 22 2020 11-17-01 PM.CSV');
  });
  it('check JobStatusResponseModel parsing', async () => {
    const rawXml = await LoadExample('job_status_response', ExampleType.Response);
    const result = await JobStatusResponseModel.Parse(rawXml);
    expect(result.JOB_ID).toBe(173476817);
    expect(result.JOB_STATUS).toBe('ERROR');
    expect(result.JOB_DESCRIPTION).toBe('Exporting all contact source data, Copy of WCA Global Database  10.15.2020');
    expect(result.PARAMETERS.length).toBe(22);
  });
});
