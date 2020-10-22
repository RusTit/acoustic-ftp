import needle, { NeedleOptions } from 'needle';
import Bottleneck from 'bottleneck';
import { Logger } from 'log4js';
import { LoggerFactory } from './logger';

const LIMITER_OPTIONS: Bottleneck.ConstructorOptions = {
  reservoir: 15, // initial value
  reservoirRefreshAmount: 15,
  reservoirRefreshInterval: 60 * 1000, // must be divisible by 250

  // also use maxConcurrent and/or minTime for safety
  maxConcurrent: 1,
  minTime: 1000, // pick a value that makes sense for your use case
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
    return '';
  }
}
