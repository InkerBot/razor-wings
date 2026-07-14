import type AbstractModule from "@/modules/AbstractModule.ts";
import razorModSdk from "@/razor-wings";
import {selectTarget} from "@/util/selectTarget.ts";
import historyModule from "@/modules/history/module.ts";
import {razorIsPro} from "@/util/pro.ts";
import {sendActivityText} from "@/util/message.ts";
import i18n from "@/i18n";

class UtilUnlockModule implements AbstractModule {
  tiggerTextEnable: boolean = false
  tiggerText: string = i18n.t('unlock.defaultTrigger')

  init() {
    razorModSdk.hookFunction("ChatRoomMessageDisplay", 10, ([data, ...msg], next) => {
      if (this.tiggerTextEnable && ['Chat', 'Whisper', 'Emote'].indexOf(data.Type) !== -1 && data.Sender === Player.MemberNumber && data.Content.startsWith(this.tiggerText)) {
        (async () => {
          const targetExpr = data.Content.substring(this.tiggerText.length);
          const target = selectTarget(targetExpr);
          if (!target) {
            ChatRoomSendLocal(i18n.t('unlock.targetNotFound', {target: targetExpr}), 3000);
            return
          }
          this.run(target);
        })().catch(console.error);
      }

      return next([data, ...msg]);
    });
  }

  run(target: Character) {
    historyModule.pushReason({text: "razor-wings unlock"}, () => {
      if (!razorIsPro()) {
        sendActivityText(i18n.t('unlock.activity', {
          actor: Player.Nickname || Player.Name,
          target: target.Nickname || target.Name,
        }));
      }

      CharacterReleaseTotal(target);
      target.ArousalSettings.Progress = 0;
      ChatRoomCharacterUpdate(target);
    });
  }

  loadConfig() {
    const localStorageElement = localStorage['razorwings.util_unlock'];
    if (localStorageElement) {
      const config = JSON.parse(localStorageElement);
      this.tiggerTextEnable = config.tiggerTextEnable || false;
      this.tiggerText = config.tiggerText || i18n.t('unlock.defaultTrigger');
    } else {
      this.saveConfig();
    }
  }

  saveConfig() {
    localStorage['razorwings.util_unlock'] = JSON.stringify({
      tiggerTextEnable: this.tiggerTextEnable,
      tiggerText: this.tiggerText,
    });
  }
}

export default new UtilUnlockModule();
