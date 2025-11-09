export interface TrapScript {
  id: string;
  name: string;
  content: string;
  enabled: boolean;
}

export default interface TrapConfig {
  scripts: TrapScript[];
}
