import {
  GetExportFromDatabaseModel,
  GetJobStatus,
  GetListDataBaseModel,
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
      LIST_ID: 123,
      EXPORT_TYPE: 'ALL',
      EXPORT_FORMAT: 'CSV',
    }]);
    const strResult = model.getXmlModel();
    const testCase =
      `<Envelope>
  <Body>
    <ExportList>
      <LIST_ID>123</LIST_ID>
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
});
