export interface Modifier {
  priority?: number;
  comment?: string;
  effect: (intensity: number, context: Record<string, unknown>) => number;
  conditions?: {
    context?: Record<string, unknown>;
    status?: string;
    [key: string]: unknown;
  };
}

export class ConfigRegistry {
  private system: { registerModifier: (name: string, modifier: Modifier) => void };

  constructor(system: { registerModifier: (name: string, modifier: Modifier) => void }) {
    this.system = system;
  }

  // Register action modifiers.
  registerAction(actions: string | string[], modifier: Modifier) {
    if (typeof actions === 'string') {
      this.system.registerModifier(`action:${actions}`, modifier);
    } else for (const action of actions) {
      this.system.registerModifier(`action:${action}`, modifier);
    }
  }

  // Register target modifiers.
  registerTarget(targets: string | string[], modifier: Modifier) {
    if (typeof targets === 'string') {
      this.system.registerModifier(`target:${targets}`, modifier);
    } else for (const target of targets) {
      this.system.registerModifier(`target:${target}`, modifier);
    }
  }

  // Register item modifiers.
  registerItem(items: string | string[], modifier: Modifier) {
    if (typeof items === 'string') {
      this.system.registerModifier(`item:${items}`, modifier);
    } else for (const item of items) {
      this.system.registerModifier(`item:${item}`, modifier);
    }
  }

  // Register global modifiers.
  registerGlobal(modifier: Modifier) {
    this.system.registerModifier('global', modifier);
  }
}
