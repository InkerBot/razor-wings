import Sandbox from "@nyariv/sandboxjs";
import type {IExecContext, IScope} from "@nyariv/sandboxjs/dist/node/utils";
import type MapScriptConfig from "./MapScriptConfig.ts";
import common_functions from "./functions/functions.ts"

type CompiledScript = (...scopes: IScope[]) => {
  context: IExecContext;
  run: () => unknown;
};

class MapScriptEngine {
  private sandbox: Sandbox;

  private scriptConfig: MapScriptConfig
  private compiledScripts: {[k: number]: CompiledScript} = {};

  constructor() {
    const prototypeWhitelist = Sandbox.SAFE_PROTOTYPES;
    prototypeWhitelist.set(Node, new Set());

    const globals = {...Sandbox.SAFE_GLOBALS, ...common_functions};

    this.sandbox = new Sandbox({globals, prototypeWhitelist});
    this.scriptConfig = {
      tiggers: {}
    };
  }

  setScriptConfig(config: MapScriptConfig) {
    this.scriptConfig = config;
    this.reloadScriptConfig();
  }

  reloadScriptConfig() {
    this.compiledScripts = {};
  }

  characterMoveIn(character: Character, x: number, y: number) {
    const blockId = x * 1000 + y;
    const scriptContent = this.scriptConfig.tiggers[blockId];
    if (!scriptContent) return;

    let compiled = this.compiledScripts[blockId];
    if (!compiled) {
      compiled = this.sandbox.compile(scriptContent, true);
      this.compiledScripts[blockId] = compiled;
    }

    const execution = compiled({character: character, x: x, y: y })
    execution.run()
  }
}

export default new MapScriptEngine();
