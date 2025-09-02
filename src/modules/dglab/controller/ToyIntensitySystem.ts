import type {Modifier} from './ConfigRegistry';

export class ToyIntensitySystem {
  private registry: Map<string, Modifier[]>;
  private context: Record<string, unknown>;

  constructor() {
    this.registry = new Map();
    this.context = {};
  }

  registerModifier(name: string, modifier: Modifier) {
    if (!this.registry.has(name)) {
      this.registry.set(name, []);
    }
    this.registry.get(name)!.push(modifier);

    // Sort by priority
    this.registry.get(name)!.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  setContext(context: Record<string, any>) {
    this.context = {...this.context, ...context};
  }

  // Calculate final intensity
  calculateIntensity(action: string, target?: string, item?: string): number {
    let intensity = 0;

    // Get all relevant modifiers
    const modifiers = this._getRelevantModifiers(action, target, item);

    // Apply all modifiers that meet the conditions
    for (const modifier of modifiers) {
      if (this._checkConditions(modifier.conditions)) {
        const oldValue = intensity;
        intensity = modifier.effect(intensity, this.context);
        console.debug(oldValue, ' => ', intensity, ', modifier: ', modifier.comment);
      }
    }

    // Ensure intensity is within 0-100
    return Math.max(0, Math.min(100, intensity));
  }

  // Get relevant modifiers
  private _getRelevantModifiers(action: string, target?: string, item?: string): Modifier[] {
    const relevantModifiers: Modifier[] = [];

    if (this.registry.has(`action:${action}`)) {
      relevantModifiers.push(...this.registry.get(`action:${action}`)!);
    }

    if (target && this.registry.has(`target:${target}`)) {
      relevantModifiers.push(...this.registry.get(`target:${target}`)!);
    }

    if (item && this.registry.has(`item:${item}`)) {
      relevantModifiers.push(...this.registry.get(`item:${item}`)!);
    }

    if (this.registry.has('global')) {
      relevantModifiers.push(...this.registry.get('global')!);
    }

    return relevantModifiers.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  // Check if conditions are met
  private _checkConditions(conditions?: Modifier['conditions']): boolean {
    if (!conditions) return true;

    // Check context conditions
    if (conditions.context) {
      for (const [key, value] of Object.entries(conditions.context)) {
        if (this.context[key] !== value) {
          return false;
        }
      }
    }

    return true;
  }
}
