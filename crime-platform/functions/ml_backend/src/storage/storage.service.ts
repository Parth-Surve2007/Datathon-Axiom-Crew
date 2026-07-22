import { BaseService } from '@services/base.service';

/**
 * StorageService — Abstracts Zoho Catalyst File Store operations.
 *
 * Phase 3:
 * - Upload FIR attachments
 * - Store generated reports
 * - Signed URL generation for downloads
 */
export class StorageService extends BaseService {
  constructor() {
    super('StorageService');
  }

  async uploadFile(_buffer: Buffer, _filename: string): Promise<string> {
    this.log.warn('uploadFile: not yet implemented');
    return '';
  }

  async getSignedUrl(_fileId: string): Promise<string> {
    this.log.warn('getSignedUrl: not yet implemented');
    return '';
  }
}
