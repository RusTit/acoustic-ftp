import {
  AccessToken,
  GetExportFromDatabaseModel,
  GetJobStatus,
  GetListDataBaseModel, ListDataBaseResponseModel,
  ListTypeEnum,
  VisibilityEnum,
} from '../src/AcousticModels';

/**
 * Two minutes for jest test case.
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
  it('check GetExportFromDatabaseModel xml string', () => {
    const model = new GetExportFromDatabaseModel([{
      LIST_ID: 40462047,
      EXPORT_TYPE: 'ALL',
      EXPORT_FORMAT: 'CSV',
    }]);
    const strResult = model.getXmlModel();
    const testCase =
      `<Envelope>
  <Body>
    <ExportList>
      <LIST_ID>40462047</LIST_ID>
      <EXPORT_TYPE>ALL</EXPORT_TYPE>
      <EXPORT_FORMAT>CSV</EXPORT_FORMAT>
    </ExportList>
  </Body>
</Envelope>`;
    expect(strResult).toBe(testCase);
  });
  it('check GetJobStatus xml string', () => {
    const model = new GetJobStatus(123);
    const strResult = model.getXmlModel();
    const testCase =
      `<Envelope>
  <Body>
    <GetJobStatus>
      <JOB_ID>123</JOB_ID>
    </GetJobStatus>
  </Body>
</Envelope>`;
    expect(strResult).toBe(testCase);
  });
  it('check GetListDataBaseModel xml string', () => {
    const model = new GetListDataBaseModel(VisibilityEnum.Shared, ListTypeEnum.Databases);
    const strResult = model.getXmlModel();
    const testCase =
      `<Envelope>
  <Body>
    <GetLists>
      <VISIBILITY>1</VISIBILITY>
      <LIST_TYPE>0</LIST_TYPE>
    </GetLists>
  </Body>
</Envelope>`;
    expect(strResult).toBe(testCase);
  });
  it('check ListDataBaseResponseModel parsing', async () => {
    const rawXml =
      `<Envelope>
    <Body>
        <RESULT>
            <SUCCESS>TRUE</SUCCESS>
            <LIST>
                <ID>16529017</ID>
                <NAME>Archive</NAME>
                <TYPE>0</TYPE>
                <SIZE>0</SIZE>
                <NUM_OPT_OUTS>0</NUM_OPT_OUTS>
                <NUM_UNDELIVERABLE>0</NUM_UNDELIVERABLE>
                <LAST_MODIFIED>06/01/16 11:18 AM</LAST_MODIFIED>
                <VISIBILITY>1</VISIBILITY>
                <PARENT_NAME/>
                <USER_ID>161cf73-12b9c2ce7d3-4f4749e15ce6d7a21b02ab08b9b7921c</USER_ID>
                <PARENT_FOLDER_ID>6849213</PARENT_FOLDER_ID>
                <IS_FOLDER>true</IS_FOLDER>
                <FLAGGED_FOR_BACKUP>false</FLAGGED_FOR_BACKUP>
                <SUPPRESSION_LIST_ID>0</SUPPRESSION_LIST_ID>
                <IS_DATABASE_TEMPLATE>false</IS_DATABASE_TEMPLATE>
            </LIST>
            <LIST>
                <ID>17303784</ID>
                <NAME>Imported Lists</NAME>
                <TYPE>0</TYPE>
                <SIZE>0</SIZE>
                <NUM_OPT_OUTS>0</NUM_OPT_OUTS>
                <NUM_UNDELIVERABLE>0</NUM_UNDELIVERABLE>
                <LAST_MODIFIED>11/02/16 10:40 AM</LAST_MODIFIED>
                <VISIBILITY>1</VISIBILITY>
                <PARENT_NAME/>
                <USER_ID>16cddf1a-14c354570f3-b72427ac28f4177bd55290ce12678282</USER_ID>
                <PARENT_FOLDER_ID>6849213</PARENT_FOLDER_ID>
                <IS_FOLDER>true</IS_FOLDER>
                <FLAGGED_FOR_BACKUP>false</FLAGGED_FOR_BACKUP>
                <SUPPRESSION_LIST_ID>0</SUPPRESSION_LIST_ID>
                <IS_DATABASE_TEMPLATE>false</IS_DATABASE_TEMPLATE>
            </LIST>
            <LIST>
                <ID>40462047</ID>
                <NAME>Copy of WCA Global Database  10.15.2020</NAME>
                <TYPE>0</TYPE>
                <SIZE>620757</SIZE>
                <NUM_OPT_OUTS>6485</NUM_OPT_OUTS>
                <NUM_UNDELIVERABLE>0</NUM_UNDELIVERABLE>
                <LAST_MODIFIED>10/15/20 04:09 PM</LAST_MODIFIED>
                <VISIBILITY>1</VISIBILITY>
                <PARENT_NAME/>
                <USER_ID>2cbaaf5d-158d4dbb9e6-b72427ac28f4177bd55290ce12678282</USER_ID>
                <PARENT_FOLDER_ID>6849213</PARENT_FOLDER_ID>
                <IS_FOLDER>false</IS_FOLDER>
                <FLAGGED_FOR_BACKUP>false</FLAGGED_FOR_BACKUP>
                <SUPPRESSION_LIST_ID>0</SUPPRESSION_LIST_ID>
                <IS_DATABASE_TEMPLATE>false</IS_DATABASE_TEMPLATE>
            </LIST>
            <LIST>
                <ID>35287127</ID>
                <NAME>Copy of WCA Global Database  7.16.2020</NAME>
                <TYPE>0</TYPE>
                <SIZE>609230</SIZE>
                <NUM_OPT_OUTS>6196</NUM_OPT_OUTS>
                <NUM_UNDELIVERABLE>0</NUM_UNDELIVERABLE>
                <LAST_MODIFIED>07/16/20 09:57 AM</LAST_MODIFIED>
                <VISIBILITY>1</VISIBILITY>
                <PARENT_NAME/>
                <USER_ID>2cbaaf5d-158d4dbb9e6-b72427ac28f4177bd55290ce12678282</USER_ID>
                <PARENT_FOLDER_ID>6849213</PARENT_FOLDER_ID>
                <IS_FOLDER>false</IS_FOLDER>
                <FLAGGED_FOR_BACKUP>false</FLAGGED_FOR_BACKUP>
                <SUPPRESSION_LIST_ID>0</SUPPRESSION_LIST_ID>
                <IS_DATABASE_TEMPLATE>false</IS_DATABASE_TEMPLATE>
            </LIST>
            <LIST>
                <ID>20718361</ID>
                <NAME>WCA Global Database </NAME>
                <TYPE>0</TYPE>
                <SIZE>621477</SIZE>
                <NUM_OPT_OUTS>6514</NUM_OPT_OUTS>
                <NUM_UNDELIVERABLE>0</NUM_UNDELIVERABLE>
                <LAST_MODIFIED>10/22/20 09:09 PM</LAST_MODIFIED>
                <VISIBILITY>1</VISIBILITY>
                <PARENT_NAME/>
                <USER_ID>2cbaaf5d-158d4dbb9e6-b72427ac28f4177bd55290ce12678282</USER_ID>
                <PARENT_FOLDER_ID>6849213</PARENT_FOLDER_ID>
                <IS_FOLDER>false</IS_FOLDER>
                <FLAGGED_FOR_BACKUP>false</FLAGGED_FOR_BACKUP>
                <SUPPRESSION_LIST_ID>0</SUPPRESSION_LIST_ID>
                <IS_DATABASE_TEMPLATE>false</IS_DATABASE_TEMPLATE>
            </LIST>
            <LIST>
                <ID>25116223</ID>
                <NAME>WCA Test Database </NAME>
                <TYPE>0</TYPE>
                <SIZE>502</SIZE>
                <NUM_OPT_OUTS>0</NUM_OPT_OUTS>
                <NUM_UNDELIVERABLE>0</NUM_UNDELIVERABLE>
                <LAST_MODIFIED>09/12/19 11:43 AM</LAST_MODIFIED>
                <VISIBILITY>1</VISIBILITY>
                <PARENT_NAME/>
                <USER_ID>2cbaaf5d-158d4dbb9e6-b72427ac28f4177bd55290ce12678282</USER_ID>
                <PARENT_FOLDER_ID>6849213</PARENT_FOLDER_ID>
                <IS_FOLDER>false</IS_FOLDER>
                <FLAGGED_FOR_BACKUP>false</FLAGGED_FOR_BACKUP>
                <SUPPRESSION_LIST_ID>0</SUPPRESSION_LIST_ID>
                <IS_DATABASE_TEMPLATE>false</IS_DATABASE_TEMPLATE>
            </LIST>
        </RESULT>
    </Body>
</Envelope>`;
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
});
