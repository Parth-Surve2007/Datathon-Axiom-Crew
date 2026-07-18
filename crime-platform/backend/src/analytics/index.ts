/**
 * Analytics module entry point.
 * Will house: CrimeTrendService, HotspotAnalyzer, PredictiveScorer.
 *
 * TODO (Phase 2):
 * - Connect to Catalyst Data Store ZCQL queries
 * - Implement time-series aggregations
 * - Expose results via /api/v1/analytics routes
 */

export * from './trend.service';
