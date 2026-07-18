import { getCatalystApp } from '../../config/database';
import type { IFirRepository } from '../interfaces';
import type { FindManyResult } from '../../types/index';
import { createLogger } from '../../config/logger';

const log = createLogger('CatalystFirRepository');

export class CatalystFirRepository implements IFirRepository {
  private app: any; // Catalyst app instance
  private tableName = 'firs';

  constructor() {
    this.app = getCatalystApp();
  }

  async findById(id: string): Promise<any | null> {
    try {
      // Assuming catalyst SDK structure: app.datastore().table(name).getRow(id)
      const datastore = this.app.datastore();
      const table = datastore.table(this.tableName);
      const row = await table.getRow(id);
      return row;
    } catch (err) {
      log.error({ err, id }, 'Catalyst datastore error on findById');
      return null; // Assuming row not found throws or returns null depending on SDK
    }
  }

  async findMany(params: { page: number; limit: number }): Promise<FindManyResult<any>> {
    const offset = (params.page - 1) * params.limit;
    
    try {
      // Mocking ZCQL query for catalyst
      const zcql = this.app.zcql();
      
      const countQuery = `SELECT count(ROWID) FROM ${this.tableName}`;
      const countRes = await zcql.executeZCQLQuery(countQuery);
      const total = parseInt(countRes[0][this.tableName].ROWID, 10);
      
      const query = `SELECT * FROM ${this.tableName} LIMIT ${offset}, ${params.limit}`;
      const res = await zcql.executeZCQLQuery(query);
      
      // Map Catalyst result structure to standard object array
      const data = res.map((item: any) => item[this.tableName]);
      
      return {
        data,
        total
      };
    } catch (err) {
      log.error({ err }, 'Catalyst datastore error on findMany');
      return { data: [], total: 0 };
    }
  }

  async create(dto: any): Promise<any> {
    try {
      const datastore = this.app.datastore();
      const table = datastore.table(this.tableName);
      const row = await table.insertRow(dto);
      return row;
    } catch (err) {
      log.error({ err }, 'Catalyst datastore error on create');
      throw err;
    }
  }

  async update(id: string, dto: any): Promise<any | null> {
    try {
      const datastore = this.app.datastore();
      const table = datastore.table(this.tableName);
      // Construct update object combining ID and changed fields
      const updateData = { ROWID: id, ...dto };
      const row = await table.updateRow(updateData);
      return row;
    } catch (err) {
      log.error({ err, id }, 'Catalyst datastore error on update');
      throw err;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const datastore = this.app.datastore();
      const table = datastore.table(this.tableName);
      await table.deleteRow(id);
      return true; // Hard delete for Catalyst here as soft delete is complex without custom ZCQL
    } catch (err) {
      log.error({ err, id }, 'Catalyst datastore error on delete');
      return false;
    }
  }

  async findByFirNumber(firNumber: string): Promise<any | null> {
    try {
      const zcql = this.app.zcql();
      const query = `SELECT * FROM ${this.tableName} WHERE fir_number = '${firNumber}'`;
      const res = await zcql.executeZCQLQuery(query);
      
      if (res.length === 0) return null;
      return res[0][this.tableName];
    } catch (err) {
      log.error({ err, firNumber }, 'Catalyst datastore error on findByFirNumber');
      return null;
    }
  }

  async findFirsByStation(stationId: string, page: number, limit: number): Promise<FindManyResult<any>> {
    const offset = (page - 1) * limit;
    
    try {
      const zcql = this.app.zcql();
      
      const countQuery = `SELECT count(ROWID) FROM ${this.tableName} WHERE station_id = '${stationId}'`;
      const countRes = await zcql.executeZCQLQuery(countQuery);
      const total = parseInt(countRes[0][this.tableName].ROWID, 10);
      
      const query = `SELECT * FROM ${this.tableName} WHERE station_id = '${stationId}' LIMIT ${offset}, ${limit}`;
      const res = await zcql.executeZCQLQuery(query);
      
      const data = res.map((item: any) => item[this.tableName]);
      
      return {
        data,
        total
      };
    } catch (err) {
      log.error({ err, stationId }, 'Catalyst datastore error on findFirsByStation');
      return { data: [], total: 0 };
    }
  }
}
