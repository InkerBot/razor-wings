import type AbstractModule from "../AbstractModule.ts";
import type TrapConfig from "./TrapConfig.ts";
import type { TrapScript } from "./TrapConfig.ts";
import razorModSdk from "../../razor-wings";
import type {IExecContext, IScope} from "@nyariv/sandboxjs/dist/node/utils";
import Sandbox from "@nyariv/sandboxjs";
import common_functions from "../map_script/functions/functions.ts";

const STORAGE_KEY = 'razorwings.util_trap_config';

class UtilTrapModule implements AbstractModule {
  config: TrapConfig = {
    scripts: []
  };

  private sandbox: Sandbox;
  trapRoomEnabled: boolean = false;

  private scriptCache: Map<string, (...scopes: IScope[]) => { context: IExecContext; run: () => unknown; }> = new Map();
  private configChangeListeners: (() => void)[] = [
    ()=> { this.scriptCache.clear(); },
  ];

  constructor() {
    const prototypeWhitelist = Sandbox.SAFE_PROTOTYPES;
    prototypeWhitelist.set(Node, new Set());

    const globals = {...Sandbox.SAFE_GLOBALS, ...common_functions};

    this.sandbox = new Sandbox({globals, prototypeWhitelist});
  }

  private randomScript(): TrapScript {
    const enabledScripts = this.config.scripts.filter(s => s.enabled);
    if (enabledScripts.length === 0) {
      throw new Error('No enabled trap scripts available');
    }
    const index = Math.floor(Math.random() * enabledScripts.length);
    return enabledScripts[index];
  }

  init() {
    razorModSdk.hookFunction('ChatRoomNotificationRaiseChatJoin', 10, ([character, ...args], next) => {
      const result = next([character, ...args]);
      if (this.trapRoomEnabled) {
        setTimeout(() => {
          if (this.config.scripts.length > 0) {
            try {
              const script = this.randomScript();
              this.runTrapOnCharacter(character, script);
            } catch (e) {
              console.error('Error executing trap script:', e);
            }
          }
        }, 1000);
      }
      return result;
    });
  }

  runTrapOnCharacter(character: Character, script: TrapScript, overrideContent?: string) {
    if (!overrideContent) {
      let compiled = this.scriptCache.get(script.id);
      if (!compiled) {
        compiled = this.sandbox.compile(script.content, true);
        this.scriptCache.set(script.id, compiled);
      }
      compiled({character: character}).run();
    } else {
      const compiled = this.sandbox.compile(overrideContent);
      compiled({character: character}).run();
    }
  }

  loadConfig() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.config = {
          scripts: parsed.scripts || []
        };
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
