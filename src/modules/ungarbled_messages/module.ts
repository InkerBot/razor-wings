import type AbstractModule from "../AbstractModule.ts";
import razorModSdk from "../../razor-wings";

class UngarbledMessagesModule implements AbstractModule {
  enabled: boolean = false;

  init() {
    razorModSdk.hookFunction("ChatRoomMessage", 10, ([data, ...msg], next) => {
      const oldValue = Player?.ImmersionSettings?.ShowUngarbledMessages ?? true;
      let result: unknown;
      try {
        if (Player && Player.ImmersionSettings) {
          Player.ImmersionSettings.ShowUngarbledMessages = true;
        }
        result = next([data, ...msg]);
      } finally {
        if (Player && Player.ImmersionSettings) {
          Player.ImmersionSettings.ShowUngarbledMessages = oldValue;
        }
      }
      return result;
    });
  }

  loadConfig() {
    const localStorageElement = localStorage['razorwings.ungarbled_messages'];
    if (localStorageElement) {
      const config = JSON.parse(localStorageElement);
      this.enabled = config.enabled ?? false;
    } else {
      this.saveConfig();
    }
  }

  saveConfig() {
    localStorage['razorwings.ungarbled_messages'] = JSON.stringify({
      enabled: this.enabled,
    });
  }
}

export default new UngarbledMessagesModule();
