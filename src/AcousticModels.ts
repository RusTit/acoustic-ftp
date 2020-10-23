import { Builder, Parser } from 'xml2js';

export enum VisibilityEnum {
  Private = 0,
  Shared = 1,
}

export enum ListTypeEnum {
  Databases = 0,
  Queries = 1,
  DatabasesContactListsQueries = 2,
  TestLists = 5,
  SeedLists = 6,
  SuppressionLists = 13,
  RelationalTables = 15,
  ContactLists = 18,
}

export type TODO_ANY = any;

export type BOOL_XML_LITERAL = 'True' | 'False';

export type INCLUDE_ALL_LIST_LITERAL = BOOL_XML_LITERAL;

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export interface DatabaseResponseObject {
  ID: number;
  NAME: string;
  TYPE: ListTypeEnum;
  SIZE: number;
  NUM_OPT_OUTS: number;
  NUM_UNDELIVERABLE: number;
  LAST_MODIFIED: string;
  VISIBILITY: VisibilityEnum;
  PARENT_NAME: string;
  USER_ID: string;
  PARENT_FOLDER_ID: number;
  IS_FOLDER: boolean;
  FLAGGED_FOR_BACKUP: boolean;
  SUPPRESSION_LIST_ID: number;
  IS_DATABASE_TEMPLATE: string;
}

export type ExportTypeLiteral = 'ALL' | 'OPT_IN' | 'OPT_OUT' | 'UNDELIVERABLE';

export type ExportFormatLiteral = 'CSV' | 'TAB' | 'PIPE';

export type ExportFileEncodingLiteral = 'utf-8' | 'iso-8859-1';

export type Column = {
  COLUMN: string;
};

export type CommonDataType = {
  Envelope: {
    Body: Record<string, unknown>;
  };
};

export abstract class CommonGetXmlModel {
  public readonly builder: Builder;
  protected constructor() {
    this.builder = new Builder({
      headless: true,
    });
  }

  getCommonData(): CommonDataType {
    return {
      Envelope: {
        Body: {},
      },
    };
  }

  abstract getXmlModel(): string;
}

export type ExportListType = {
  LIST_ID: number;
  EXPORT_TYPE: ExportTypeLiteral;
  EXPORT_FORMAT: ExportFormatLiteral;
  EMAIL?: string;
  FILE_ENCODING?: ExportFileEncodingLiteral;
  ADD_TO_STORED_FILES?: string;
  DATE_START?: string;
  DATE_END?: string;
  USE_CREATED_DATE?: string;
  INCLUDE_LEAD_SOURCE?: string;
  LIST_DATE_FORMAT?: string;
  INCLUDE_RECIPIENT_ID?: string;
  EXPORT_COLUMNS?: Column[];
};

export type JobStatusLiteral =
  | 'WAITING'
  | 'RUNNING'
  | 'CANCELLED'
  | 'ERROR'
  | 'COMPLETE';

export class JobStatusResponseModel {
  public readonly JOB_ID: number;
  public readonly JOB_STATUS: JobStatusLiteral;
  public readonly JOB_DESCRIPTION: string;
  public readonly PARAMETERS: unknown[];

  constructor(data: TODO_ANY) {
    if (data?.Envelope?.Body?.RESULT?.SUCCESS !== 'TRUE') {
      throw new ParseError(`Invalid export response: ${JSON.stringify(data)}`);
    }
    const { RESULT } = data.Envelope.Body;
    this.JOB_ID = Number.parseInt(RESULT.JOB_ID);
    this.JOB_STATUS = RESULT.JOB_STATUS;
    this.JOB_DESCRIPTION = RESULT.JOB_DESCRIPTION;
    this.PARAMETERS = RESULT.PARAMETERS.PARAMETER;
  }

  static async Parse(rawData: string): Promise<JobStatusResponseModel> {
    const parser = new Parser({
      explicitArray: false,
    });
    const data = await parser.parseStringPromise(rawData);
    return new JobStatusResponseModel(data);
  }
}

export class ExportResponseModel {
  public readonly JobId: number;
  public readonly FilePath: string;

  constructor(data: TODO_ANY) {
    if (data?.Envelope?.Body?.RESULT?.SUCCESS !== 'TRUE') {
      throw new ParseError(`Invalid export response: ${JSON.stringify(data)}`);
    }
    const { JOB_ID, FILE_PATH } = data.Envelope.Body.RESULT;
    this.JobId = Number.parseInt(JOB_ID);
    this.FilePath = FILE_PATH;
  }

  static async Parse(rawData: string): Promise<ExportResponseModel> {
    const parser = new Parser({
      explicitArray: false,
    });
    const data = await parser.parseStringPromise(rawData);
    return new ExportResponseModel(data);
  }
}

export class GetExportFromDatabaseModel extends CommonGetXmlModel {
  constructor(public readonly ExportList: ExportListType[]) {
    super();
  }

  public getXmlModel(): string {
    const data = this.getCommonData();
    data.Envelope.Body.ExportList = this.ExportList;
    return this.builder.buildObject(data);
  }
}

export class ListDataBaseResponseModel {
  public readonly DatabaseList: DatabaseResponseObject[];

  constructor(data: TODO_ANY) {
    if (
      data?.Envelope?.Body?.RESULT?.SUCCESS !== 'TRUE' ||
      typeof data?.Envelope?.Body?.RESULT?.LIST === 'undefined'
    ) {
      throw new ParseError(`Invalid Body: ${JSON.stringify(data)}`);
    }
    const list = Array.isArray(data.Envelope.Body.RESULT.LIST) // xml2js parsing minor issue
      ? data?.Envelope?.Body?.RESULT?.LIST
      : [data?.Envelope?.Body?.RESULT?.LIST];
    this.DatabaseList = list.map((item: TODO_ANY) => {
      item.ID = Number.parseInt(item.ID);
      item.TYPE = Number.parseInt(item.TYPE);
      item.SIZE = Number.parseInt(item.SIZE);
      item.NUM_OPT_OUTS = Number.parseInt(item.NUM_OPT_OUTS);
      item.NUM_UNDELIVERABLE = Number.parseInt(item.NUM_UNDELIVERABLE);
      item.VISIBILITY = Number.parseInt(item.VISIBILITY);
      item.PARENT_FOLDER_ID = Number.parseInt(item.PARENT_FOLDER_ID);
      item.IS_FOLDER = item.IS_FOLDER.toLowerCase() === 'true';
      item.FLAGGED_FOR_BACKUP =
        item.FLAGGED_FOR_BACKUP.toLowerCase() === 'true';
      item.SUPPRESSION_LIST_ID = Number.parseInt(item.SUPPRESSION_LIST_ID);
      item.IS_DATABASE_TEMPLATE =
        item.IS_DATABASE_TEMPLATE.toLowerCase() === 'true';
      return item as DatabaseResponseObject;
    });
  }

  static async Parse(rawData: string): Promise<ListDataBaseResponseModel> {
    const parser = new Parser({
      explicitArray: false,
    });
    const data = await parser.parseStringPromise(rawData);
    return new ListDataBaseResponseModel(data);
  }
}

export class GetJobStatusModel extends CommonGetXmlModel {
  constructor(public readonly JOB_ID: number) {
    super();
  }

  getXmlModel(): string {
    const data = this.getCommonData();
    data.Envelope.Body.GetJobStatus = {
      JOB_ID: this.JOB_ID,
    };
    return this.builder.buildObject(data);
  }
}

export class GetListDataBaseModel extends CommonGetXmlModel {
  constructor(
    public readonly VISIBILITY: VisibilityEnum,
    public readonly LIST_TYPE: ListTypeEnum,
    public readonly FOLDER_ID?: number,
    public readonly INCLUDE_ALL_LISTS?: INCLUDE_ALL_LIST_LITERAL,
    public readonly INCLUDE_TAGS?: string[]
  ) {
    super();
  }

  public getXmlModel(): string {
    const data = this.getCommonData();
    data.Envelope.Body.GetLists = {
      VISIBILITY: this.VISIBILITY,
      LIST_TYPE: this.LIST_TYPE,
    };
    const GetLists: TODO_ANY = data.Envelope.Body.GetLists;
    if (typeof this.FOLDER_ID !== 'undefined') {
      GetLists.FOLDER_ID = this.FOLDER_ID;
    }
    if (typeof this.INCLUDE_ALL_LISTS !== 'undefined') {
      GetLists.INCLUDE_ALL_LISTS = this.INCLUDE_ALL_LISTS;
    }
    if (typeof this.INCLUDE_TAGS !== 'undefined') {
      GetLists.INCLUDE_TAGS = this.INCLUDE_TAGS;
    }
    return this.builder.buildObject(data);
  }
}

export class AccessToken {
  public readonly expires_at: Date;
  constructor(
    public readonly access_token: string,
    public readonly token_type: string,
    public readonly refresh_token: string,
    public readonly expires_in: number
  ) {
    this.expires_at = new Date(Date.now() + expires_in * 1000);
  }

  public isOutDated(): boolean {
    const diff = this.expires_at.getTime() - new Date().getTime();
    return diff < 0;
  }

  public toString(): string {
    return `Access token: ${this.access_token} is valid: ${!this.isOutDated()}`;
  }
}
