import type AbstractModule from "../AbstractModule.ts";
import MapScriptEngine from "./MapScriptEngine.ts";
import razorModSdk from "../../razor-wings";
import type MapScriptConfig from "./MapScriptConfig.ts";

class MapScriptModule implements AbstractModule {
  private latestPosition: WeakMap<Character, ChatRoomMapPos> = new WeakMap();
  private engine = MapScriptEngine;

  playerPos = {X: 0, Y: 0};
  private playerPosListeners: (() => void)[] = [];
  config: MapScriptConfig = {
    tiggers: {}
  };

  init() {
    razorModSdk.hookFunction('ChatRoomMapViewUpdatePlayerSync', 10, (args, next) => {
      next(args);

      const x = Player.MapData.Pos.X;
      const y = Player.MapData.Pos.Y;

      const lastPos = this.latestPosition.get(Player);
      if (lastPos && lastPos.X === x && lastPos.Y === y) {
        return;
      }
      this.latestPosition.set(Player, {X: x, Y: y});
      this.playerMoveIn(x, y);
      this.engine.characterMoveIn(Player, x, y);
    });

    razorModSdk.hookFunction('ChatRoomMapViewSyncMapData', 10, ([data, ...args], next) => {
      next([data, ...args]);

      if (!ChatRoomData) return;
      if (!CommonIsObject(data) || typeof data.MemberNumber !== "number") return;
      const char = ChatRoomCharacter.find(c => c.MemberNumber === data.MemberNumber);
      if (!char || char.IsPlayer()) return;

      const x = data.MapData.Pos.X;
      const y = data.MapData.Pos.Y;

      const lastPos = this.latestPosition.get(char);
      if (lastPos && lastPos.X === x && lastPos.Y === y) {
        return;
      }
      this.latestPosition.set(char, {X: x, Y: y});
      if (char === Player) this.playerMoveIn(x, y);
      this.engine.characterMoveIn(char, x, y);
    });
    this.engine.setScriptConfig(this.config);
  }

  reloadScriptConfig() {
    this.engine.reloadScriptConfig();
  }

  private playerMoveIn(x: number, y: number) {
    if (this.playerPos.X === x && this.playerPos.Y === y) return;
    this.playerPos.X = x;
    this.playerPos.Y = y;
    this.playerPosListeners.forEach(cb => cb());
  }

  registerPlayerPosListener(cb: () => void) {
    this.playerPosListeners.push(cb);
  }

  removePlayerPosListener(cb: () => void) {
    const index = this.playerPosListeners.indexOf(cb);
    if (index >= 0) {
      this.playerPosListeners.splice(index, 1);
    }
  }


  loadConfig() {

  }

  saveConfig() {

  }
}

export default new MapScriptModule();
