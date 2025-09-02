import type AbstractModule from "../AbstractModule.ts";
import razorModSdk from "../../razor-wings";
import {selectTarget} from "../../util/selectTarget.ts";
import historyModule from "../history/module.ts";
import {razorIsPro} from "../../util/pro.ts";
import {sendActivityText} from "../../util/message.ts";

class UtilLockModule implements AbstractModule {
  tiggerTextEnable: boolean = false;
  tiggerText: string = '上锁';

  init() {
    razorModSdk.hookFunction("ChatRoomMessageDisplay", 10, ([data, ...msg], next) => {
      if (this.tiggerTextEnable && ['Chat', 'Whisper', 'Emote'].indexOf(data.Type) !== -1 && data.Sender === Player.MemberNumber && data.Content.startsWith(this.tiggerText)) {
        (async () => {
          const targetExpr = data.Content.substring(this.tiggerText.length);
          const target = selectTarget(targetExpr);
          if (!target) {
            ChatRoomSendLocal(`target not found: ${targetExpr}`, 3000);
            return
          }
          this.run(target, Player.ID);
        })().catch(console.error);
      }

      return next([data, ...msg]);
    });

  }

  run(target: Character, id: number) {
    target.Appearance.forEach((item) => {
      if (item.Difficulty > 0) {
        if (item.Property == null) {
          item.Property = {};
        }
        if (item.Property.Effect == null) {
          item.Property.Effect = [];
        }
        if (item.Property.Effect.indexOf('Lock') < 0) {
          item.Property.Effect.push('Lock');
        }
        if (Math.random() > 0.5) {
          item.Property.LockedBy = 'HighSecurityPadlock';
          item.Property.LockMemberNumber = id;
          item.Property.MemberNumberListKeys = '-1';
          item.Property.LockPickSeed = '0,1,2,3,4,5,6,7,8,9,10';
        } else {
          if (Math.random() > 0.5) {
            item.Property.LockedBy = 'MistressPadlock';
          } else {
            item.Property.LockedBy = 'PandoraPadlock';
          }
        }
        item.Property.LockMemberNumber = id
      }
    })
    target.ArousalSettings.Progress = 0

    historyModule.pushReason({ text: "razor-wings lock" }, () => {
      if (!razorIsPro()) {
        sendActivityText(`${Player.Nickname || Player.Name} 上锁了 ${target.Nickname || target.Name} 的拘束。`);
      }

      ChatRoomCharacterUpdate(target);
    });
  }

  loadConfig() {
    const localStorageElement = localStorage['razorwings.util_lock'];
    if (localStorageElement) {
      const config = JSON.parse(localStorageElement);
      this.tiggerTextEnable = config.tiggerTextEnable || false;
      this.tiggerText = config.tiggerText || '上锁';
    } else {
      this.saveConfig();
    }
  }

  saveConfig() {
    localStorage['razorwings.util_lock'] = JSON.stringify({
      tiggerTextEnable: this.tiggerTextEnable,
      tiggerText: this.tiggerText,
    });
  }
}

export default new UtilLockModule();
