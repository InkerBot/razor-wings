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

  // 注册动作修饰器
  registerAction(actions: string|string[], modifier: Modifier) {
    if (typeof actions === 'string') {
      this.system.registerModifier(`action:${actions}`, modifier);
    } else for (const action of actions) {
      this.system.registerModifier(`action:${action}`, modifier);
    }
  }

  // 注册目标部位修饰器
  registerTarget(targets: string|string[], modifier: Modifier) {
    if (typeof targets === 'string') {
      this.system.registerModifier(`target:${targets}`, modifier);
    } else for (const target of targets) {
      this.system.registerModifier(`target:${target}`, modifier);
    }
  }

  // 注册物品修饰器
  registerItem(items: string|string[], modifier: Modifier) {
    if (typeof items === 'string') {
      this.system.registerModifier(`item:${items}`, modifier);
    } else for (const item of items) {
      this.system.registerModifier(`item:${item}`, modifier);
    }
  }

  // 注册全局修饰器
  registerGlobal(modifier: Modifier) {
    this.system.registerModifier('global', modifier);
  }
}

