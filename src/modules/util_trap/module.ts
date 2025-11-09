import type AbstractModule from "../AbstractModule.ts";
import type TrapConfig from "./TrapConfig.ts";

const STORAGE_KEY = 'razorwings.util_trap_config';

class UtilTrapModule implements AbstractModule {
  config: TrapConfig = {
    scripts: []
  };

  private configChangeListeners: (() => void)[] = [];

  init() {
    // 目前不需要钩子函数
  }

  loadConfig() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.config = parsed;
      }
    } catch (e) {
      console.error('Failed to load util_trap config:', e);
    }
  }

  saveConfig() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
      this.notifyConfigChange();
    } catch (e) {
      console.error('Failed to save util_trap config:', e);
    }
  }

  registerConfigChangeListener(cb: () => void) {
    this.configChangeListeners.push(cb);
  }

  removeConfigChangeListener(cb: () => void) {
    const index = this.configChangeListeners.indexOf(cb);
    if (index >= 0) {
      this.configChangeListeners.splice(index, 1);
    }
  }

  private notifyConfigChange() {
    this.configChangeListeners.forEach(cb => cb());
  }
}

export default new UtilTrapModule();
