import needle, { NeedleOptions } from 'needle';
import Bottleneck from 'bottleneck';
import { Logger } from 'log4js';
import { LoggerFactory } from './logger';

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

  async getAccessKey(): Promise<string> {
    const url = `${this.urlEndpoint}/oauth/token`;
    const bodyParts = [
      'grant_type=refresh_token',
      `client_id=${this.clientId}`,
      `client_secret=${this.clientSecret}`,
      `refresh_token=${this.clientRefreshToken}`,
    ];
    const body = bodyParts.join('');
    this.logger.debug(`Getting access token: ${url}`);
    const proxy = process.env.HTTP_PROXY;
    const response = await this.limiter.schedule(() =>
      needle('post', url, body, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        proxy,
      })
    );
    if (response.statusCode === 200) {
      return response.body;
    }
    throw new Error(
      `Invalid http code: ${response.statusCode} with body: ${response.body}`
    );
  }
}
