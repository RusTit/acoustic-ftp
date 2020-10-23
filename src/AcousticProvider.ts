import needle, { NeedleOptions, NeedleResponse } from 'needle';
import Bottleneck from 'bottleneck';
import { Logger } from 'log4js';
import { LoggerFactory } from './logger';
import {
  AccessToken,
  GetListDataBaseModel,
  ListDataBaseResponseModel,
  GetExportFromDatabaseModel,
  ExportResponseModel,
  CommonGetXmlModel,
  JobStatusResponseModel,
  GetJobStatusModel,
} from './AcousticModels';

const LIMITER_OPTIONS: Bottleneck.ConstructorOptions = {
  // reservoir: 15, // initial value
  // reservoirRefreshAmount: 15,
  // reservoirRefreshInterval: 60 * 1000, // must be divisible by 250

  // also use maxConcurrent and/or minTime for safety
  maxConcurrent: 10,
  // minTime: 1000, // pick a value that makes sense for your use case
} as const;

export class AcousticProvider {
  private readonly limiter: Bottleneck;
  private readonly logger: Logger;

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly clientRefreshToken: string,
    private readonly urlEndpoint: string
  ) {
    this.limiter = new Bottleneck(LIMITER_OPTIONS);
    this.logger = LoggerFactory('src/AcousticProvider.ts');
  }

  async getDatabaseList(
    accessToken: AccessToken,
    dataModel: GetListDataBaseModel
  ): Promise<ListDataBaseResponseModel> {
    const response = await this.runXmlRequest(accessToken, dataModel);
    return ListDataBaseResponseModel.Parse(response.body);
  }

  async runXmlRequest(
    accessToken: AccessToken,
    model: CommonGetXmlModel
  ): Promise<NeedleResponse> {
    const url = `${this.urlEndpoint}/XMLAPI`;
    const bodyString = model.getXmlModel();
    const response = await this.limiter.schedule(() =>
      needle('post', url, bodyString, {
        headers: {
          'Content-Type': 'text/xml;charset=utf-8',
          Authorization: `Bearer ${accessToken.access_token}`,
        },
        parse: false,
      } as NeedleOptions)
    );
    if (response.statusCode === 200) {
      return response;
    }
    throw new Error(
      `Invalid http code: ${response.statusCode} with body: ${response.body}`
    );
  }

  async runExport(
    accessToken: AccessToken,
    dataModel: GetExportFromDatabaseModel
  ): Promise<ExportResponseModel> {
    const response = await this.runXmlRequest(accessToken, dataModel);
    return ExportResponseModel.Parse(response.body);
  }

  async GetJobStatus(
    accessToken: AccessToken,
    dataModel: GetJobStatusModel
  ): Promise<JobStatusResponseModel> {
    const response = await this.runXmlRequest(accessToken, dataModel);
    return JobStatusResponseModel.Parse(response.body);
  }

  async getAccessKey(): Promise<AccessToken> {
    const url = `${this.urlEndpoint}/oauth/token`;
    const body = {
      grant_type: 'refresh_token',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: this.clientRefreshToken,
    };
    const bodyString = Object.entries(body)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    this.logger.debug(`Getting access token: ${url}`);
    const proxy = process.env.HTTP_PROXY;
    const response = await this.limiter.schedule(() =>
      needle('post', url, bodyString, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        proxy,
      } as NeedleOptions)
    );
    if (response.statusCode === 200) {
      const {
        access_token,
        token_type,
        refresh_token,
        expires_in,
      } = response.body;
      return new AccessToken(
        access_token,
        token_type,
        refresh_token,
        expires_in
      );
    }
    throw new Error(
      `Invalid http code: ${response.statusCode} with body: ${response.body}`
    );
  }
}
