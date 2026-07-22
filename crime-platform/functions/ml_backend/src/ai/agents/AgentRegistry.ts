import { IAgent } from './IAgent';

export class AgentRegistry {
  private agents: Map<string, IAgent> = new Map();

  register(agent: IAgent): void {
    if (this.agents.has(agent.name)) {
      throw new Error(`Agent ${agent.name} is already registered.`);
    }
    this.agents.set(agent.name, agent);
  }

  getAgent(name: string): IAgent | undefined {
    return this.agents.get(name);
  }

  getAllAgents(): IAgent[] {
    return Array.from(this.agents.values());
  }
}
