import type AbstractModule from "../AbstractModule.ts";
import razorModSdk from "../../razor-wings";

class PrivacyModule implements AbstractModule {
  // wce
  disableWceBeepMetadata: boolean = false;
  disableWceReport: boolean = false;
  hiddenMods: string[] = ['RazorWings'];
  // bcx
  disableBcxBeepFingerPrint: boolean = false;
  disableBcxMessage: boolean = false;
  // echo
  disableEchoMessage: boolean = false;
  // lscg
  disableLscgMessage: boolean = false;
  // mpa
  disableMpaMessage: boolean = false;
  // common
  disableAllActions: boolean = false;
  whitelist: number[] = [];

  init() {
    razorModSdk.hookFunction("ServerSend", -1, ([msg, ...args], next) => {
      if (msg == 'AccountBeep') {
        const filtered: ServerAccountBeepRequest[] = [];

        const filterWhitelistOnly = (entry: ServerAccountBeepRequest) => {
          if (this.whitelist.includes(entry.MemberNumber)) {
            filtered.push(entry);
          }
        };
        for (const entry of (args as ServerAccountBeepRequest[])) {
          // disable wce beep metadata
          if (this.disableWceBeepMetadata && typeof entry.Message === 'string' && entry.Message.includes("\uf124")) {
            const newMessage = entry.Message.substring(0, entry.Message.indexOf("\uf124"));
            if (newMessage.endsWith("\n\n")) {
              entry.Message = newMessage.substring(0, newMessage.length - 2);
            } else {
              entry.Message = newMessage;
            }
            filtered.push(entry);
            continue
          }
          // disable bcx beep finger print
          if (this.disableBcxBeepFingerPrint && (entry.BeepType == 'BCX' || (entry.BeepType == 'Leash' && CommonIsObject(entry.Message) && CommonIsObject(entry.Message.BCX)))) {
            filterWhitelistOnly(entry);
            continue
          }
          // disable lscg beep
          if (this.disableLscgMessage && entry.BeepType == 'Leash' && CommonIsObject(entry.Message) && entry.Message.IsLSCG) {
            filterWhitelistOnly(entry);
            continue
          }
          filtered.push(entry);
        }

        filtered.forEach(entry => next(['AccountBeep', entry]))
        return
      }

      if (msg == 'ChatRoomChat') {
        const filtered: ServerChatRoomMessage[] = [];

        const filterWhitelistOnly = (entry: ServerChatRoomMessage) => {
          if (entry.Target == undefined) {
            for (const character of ChatRoomCharacter) {
              if (this.whitelist.includes(character.MemberNumber)) {
                filtered.push({
                  Target: character.MemberNumber,
                  Content: entry.Content,
                  Type: entry.Type,
                  Dictionary: entry.Dictionary,
                  Timeout: entry.Timeout
                });
              }
            }
          } else if (this.whitelist.includes(entry.Target)) {
            filtered.push(entry);
          }
        }

        // skip if target is in whitelist
        for (const entry of (args as ServerChatRoomMessage[])) {
          // remove hidden mods from wce report
          if (this.hiddenMods.length != 0 && entry.Type === 'Hidden' && entry.Content == 'BCEMsg' && entry.Dictionary) {
            for (const dictionaryElement of (entry.Dictionary as never[])) {
              if (dictionaryElement['message'] && dictionaryElement['message']['type'] == 'Hello') {
                dictionaryElement['message']['otherAddons'] = (dictionaryElement['message']['otherAddons'] as ModSDKModInfo[])
                  .filter(mod => !this.hiddenMods.includes(mod.name)) as never;
              }
            }
          }
          // disable wce report
          if (this.disableWceReport && entry.Type === 'Hidden' && entry.Content == 'BCEMsg') {
            filterWhitelistOnly(entry);
            continue
          }
          // disable BCX message
          if (this.disableBcxMessage && entry.Type === 'Hidden' && entry.Content == 'BCXMsg') {
            filterWhitelistOnly(entry);
            continue
          }
          // disable echo message
          if (this.disableEchoMessage && entry.Type === 'Hidden' && entry.Content == 'ECHO_INFO2') {
            filterWhitelistOnly(entry);
            continue
          }
          // disable lscg message
          if (this.disableLscgMessage && entry.Type === 'Hidden' && entry.Content == 'LSCGMsg') {
            filterWhitelistOnly(entry);
            continue
          }
          // disable mpa message
          if (this.disableMpaMessage && entry.Type === 'Hidden' && entry.Content == 'MPA') {
            filterWhitelistOnly(entry);
            continue
          }
          // disable all actions
          if (this.disableAllActions && entry.Type === 'Action') {
            filterWhitelistOnly(entry);
            continue
          }
          filtered.push(entry)
        }

        filtered.forEach(entry => next(['ChatRoomChat', entry]))
        return
      }

      return next([msg, ...args]);
    });
  }

  loadConfig() {
    const localStorageElement = localStorage['razorwings.privacy'];
    if (localStorageElement) {
      const config = JSON.parse(localStorageElement);
      this.disableWceBeepMetadata = config.disableWceBeepMetadata ?? false;
      this.disableBcxBeepFingerPrint = config.disableBcxBeepFingerPrint ?? false;
      this.hiddenMods = config.hiddenMods || ['RazorWings'];
      this.disableWceReport = config.disableWceReport ?? false;
      this.disableBcxMessage = config.disableBcxMessage ?? false;
      this.disableEchoMessage = config.disableEchoMessage ?? false;
      this.disableLscgMessage = config.disableLscgMessage ?? false;
      this.disableMpaMessage = config.disableMpaMessage ?? false;
      this.disableAllActions = config.disableAllActions ?? false;
      this.whitelist = config.whitelist || [];
    } else {
      this.saveConfig();
    }
  }

  saveConfig() {
    localStorage['razorwings.privacy'] = JSON.stringify({
      disableWceBeepMetadata: this.disableWceBeepMetadata,
      disableWceReport: this.disableWceReport,
      hiddenMods: this.hiddenMods,
      disableBcxBeepFingerPrint: this.disableBcxBeepFingerPrint,
      disableBcxMessage: this.disableBcxMessage,
      disableEchoMessage: this.disableEchoMessage,
      disableLscgMessage: this.disableLscgMessage,
      disableMpaMessage: this.disableMpaMessage,
      disableAllActions: this.disableAllActions,
      whitelist: this.whitelist,
    });
  }

  refreshWhitelist() {

  }
}

export default new PrivacyModule();
