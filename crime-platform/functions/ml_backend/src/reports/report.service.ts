import { BaseService } from '@services/base.service';

/**
 * ReportService — Generates structured PDF/CSV intelligence reports.
 *
 * Phase 3:
 * - Use Catalyst File Store for storage
 * - Integrate with a PDF generation library (puppeteer or pdfmake)
 */
export class ReportService extends BaseService {
  constructor() {
    super('ReportService');
  }

  async generateCaseReport(_firId: string): Promise<Buffer> {
    this.log.warn('generateCaseReport: not yet implemented');
    return Buffer.from('');
  }
}
