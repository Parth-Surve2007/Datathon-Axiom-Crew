import { BaseService } from '@services/base.service';
import type { GraphNodeType, GraphEdgeType } from '@constants/index';

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  label: string;
  properties: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: GraphEdgeType;
  weight?: number;
  properties?: Record<string, unknown>;
}

export interface GraphPayload {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * GraphService — builds criminal network graph payloads from relational data.
 *
 * Phase 2: Query Person, FIR, Vehicle, and Location tables → derive nodes/edges.
 */
export class GraphService extends BaseService {
  constructor() {
    super('GraphService');
  }

  async buildNetworkForFir(_firId: string): Promise<GraphPayload> {
    this.log.warn('buildNetworkForFir: not yet implemented');
    return { nodes: [], edges: [] };
  }

  async buildNetworkForSuspect(_suspectId: string): Promise<GraphPayload> {
    this.log.warn('buildNetworkForSuspect: not yet implemented');
    return { nodes: [], edges: [] };
  }
}
