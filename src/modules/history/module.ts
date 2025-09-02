import type AbstractModule from "../AbstractModule.ts";
import razorModSdk from "../../razor-wings";

export interface HistoryEntry {
  timestamp: number;
  removed: {[k: string]: ItemBundle};
  added: {[k: string]: ItemBundle};
  changed: {[k: string]: {old: ItemBundle, new: ItemBundle}};
  reason: ReasonLine[];
  fully?: ServerAppearanceBundle
}

export interface ReasonLine {
  text: string,
  context?: ChatMessageDictionary
}

class HistoryModule implements AbstractModule {
  latestAppearance: {[k: string]: ItemBundle} = {};
  history: HistoryEntry[] = [];
  private historyChangeListeners: (() => void)[] = [];
  private reasonStack: ReasonLine[] = [];

  addHistoryChangeListener(listener: () => void) {
    this.historyChangeListeners.push(listener);
  }

  removeHistoryChangeListener(listener: () => void) {
    const index = this.historyChangeListeners.indexOf(listener);
    if (index !== -1) {
      this.historyChangeListeners.splice(index, 1);
    }
  }

  pushReason<T>(line: ReasonLine, action: () => T) {
    this.reasonStack.push(line);
    try {
      return action()
    } finally {
      // performance: use stack instead of splice, as most of the time the reason will be the last one
      if (this.reasonStack[this.reasonStack.length - 1] === line) {
        this.reasonStack.pop();
      } else {
        const index = this.reasonStack.indexOf(line);
        if (index !== -1) {
          this.reasonStack.splice(index, 1);
        }
      }
    }
  }

  pushReasonAsync<T>(line: ReasonLine, action: () => Promise<T>): Promise<T> {
    this.reasonStack.push(line);
    return action().finally(() => {
      // performance: use stack instead of splice, as most of the time the reason will be the last one
      if (this.reasonStack[this.reasonStack.length - 1] === line) {
        this.reasonStack.pop();
      } else {
        const index = this.reasonStack.indexOf(line);
        if (index !== -1) {
          this.reasonStack.splice(index, 1);
        }
      }
    });
  }

  reasonStackSnapshot(): ReasonLine[] {
    return [...this.reasonStack];
  }

  loadConfig(): void {

  }

  saveConfig(): void {
  }

  initAfterLogin() {
    this.pushReason({ text: "login" }, () => {
      this.handleAppearanceUpdate(ServerAppearanceBundle(Player.Appearance));
    });
  }

  private recordEntry(entry: HistoryEntry) {
    this.history.unshift(entry);
    if (this.history.length > 100) {
      this.history.pop();
    }
    this.historyChangeListeners.forEach(listener => listener());
  }

  private handleAppearanceUpdate(newAppearance: ServerAppearanceBundle) {
    let removedCount = 0;
    const removed: {[k: string]: ItemBundle} = {};
    let addedCount = 0;
    const added: {[k: string]: ItemBundle} = {};
    let changedCount = 0;
    const changed: {[k: string]: {old: ItemBundle, new: ItemBundle}} = {};

    const newMap: {[k: string]: ItemBundle} = {};
    for (const item of newAppearance) {
      newMap[item.Group] = item;
    }

    for (const group in this.latestAppearance) {
      if (!newMap[group]) {
        removedCount++;
        removed[group] = this.latestAppearance[group];
      } else {
        const oldItem = this.latestAppearance[group];
        const newItem = newMap[group];
        if (JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
          changedCount++;
          changed[group] = {old: oldItem, new: newItem};
        }
      }
    }

    for (const group in newMap) {
      if (!this.latestAppearance[group]) {
        addedCount++;
        added[group] = newMap[group];
      }
    }

    if (removedCount > 0 || addedCount > 0 || changedCount > 0) {
      this.latestAppearance = newMap;
      const entry: HistoryEntry = {
        timestamp: Date.now(),
        removed: removed,
        added: added,
        changed: changed,
        reason: this.reasonStackSnapshot(),
        fully: newAppearance
      };
      this.recordEntry(entry);
    }
  }

  private renderCharacterName(target: number): string {
    const C = ChatRoomCharacter.find(it => it.MemberNumber == target);
    if (C) {
      // {character.Nickname || character.Name} ({character.Name})
      return target + " - " + (C.Nickname || C.Name) + "(" + C.Name + ")";
    } else {
      return target + " - unknown";
    }
  }

  init() {
    razorModSdk.hookFunction('ServerAccountUpdate.QueueData', 10, ([data, ...args], next) => {
      if (data.Appearance && Array.isArray(data.Appearance)) {
        // fix: change cloth will cause server update, which is not required to record
        if (CurrentModule !== "Character" && CurrentScreen !== "Appearance") {
          this.pushReason({text: "local server update"}, () => {
            this.handleAppearanceUpdate(data.Appearance);
          });
        }
      }
      next([data, ...args]);
    });
    razorModSdk.hookFunction('ChatRoomCharacterUpdate', 10, ([character, ...args], next) => {
      if (character.MemberNumber === Player.MemberNumber) {
        this.pushReason({text: "local chat room update"}, () => {
          this.handleAppearanceUpdate(ServerAppearanceBundle(character.Appearance));
        });
      }
      next([character, ...args]);
    });

    // reasons
    razorModSdk.hookFunction('ChatRoomSyncItem', 10, ([data, ...args], next) => {
      if (data.Item.Target === Player.MemberNumber) {
        const dictionary: ChatMessageDictionary = [];
        dictionary.push({SourceCharacter: data.Source});
        dictionary.push({TargetCharacter: data.Item.Target});
        dictionary.push({Tag: "DestinationCharacter", MemberNumber: Player.MemberNumber, Text: CharacterNickname(Player)});
        this.pushReason({text: "Update by " + this.renderCharacterName(data.Item.Target)}, () => {
          next([data, ...args]);
        });
      } else {
        next([data, ...args]);
      }
    });

    razorModSdk.hookFunction('ServerAppearanceLoadFromBundle', 10, ([character, assetFamily, bundle, source, appearanceFull, ...args], next) => {
      if (character.MemberNumber === Player.MemberNumber) {
        const dictionary: ChatMessageDictionary = [];
        dictionary.push({SourceCharacter: source});
        dictionary.push({TargetCharacter: character.MemberNumber});
        dictionary.push({Tag: "DestinationCharacter", MemberNumber: Player.MemberNumber, Text: CharacterNickname(Player)});
        return this.pushReason({text: "Large update by " + this.renderCharacterName(source)}, () => {
          return next([character, assetFamily, bundle, source, appearanceFull, ...args]);
        });
      } else {
        return next([character, assetFamily, bundle, source, appearanceFull, ...args]);
      }
    });
  }
}

export default new HistoryModule();
