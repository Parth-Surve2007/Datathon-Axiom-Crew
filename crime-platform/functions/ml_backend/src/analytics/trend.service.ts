import { BaseService } from '@services/base.service';

/**
 * CrimeTrendService — Phase 2 implementation target.
 *
 * Responsibilities:
 * - Aggregate FIR records by category, location, and time period
 * - Identify statistically significant spikes
 * - Feed the frontend Analytics page charts
 */
export class CrimeTrendService extends BaseService {
  constructor() {
    super('CrimeTrendService');
  }

  // Stub — will query Catalyst Data Store
  async getTrendsByCategory(_params: {
    from: Date;
    to: Date;
    stationId?: string;
  }): Promise<Record<string, number>> {
    this.log.warn('getTrendsByCategory: not yet implemented');
    await Promise.resolve(); // Fixes @typescript-eslint/require-await
    return {};
  }
}
