import type AbstractModule from "../AbstractModule.ts";
import razorModSdk from "../../razor-wings";

export interface SwitchEntry {
  name: string;
  description: string;
  init: (isEnabledGetter: () => boolean) => void;
  onUpdate?: (enabled: boolean) => void;
}

export const switchEntries: SwitchEntry[] = [
  {
    name: 'unlock_all',
    description: '可以开启所有锁（除主人锁、恋人锁）',
    init(isEnabledGetter) {
      razorModSdk.hookFunction("DialogCanUnlock", 10, (args, next) => {
        if (isEnabledGetter()) {
          next(args);
          return true;
        } else {
          return next(args);
        }
      });
    }
  },
  {
    name: 'allow_all_things',
    description: '允许所有物品',
    init(isEnabledGetter) {
      razorModSdk.hookFunction("InventoryAllow", 10, (args, next) => {
        if (isEnabledGetter()) {
          next(args);
          return true;
        } else {
          return next(args);
        }
      });
      razorModSdk.hookFunction("ServerChatRoomGetAllowItem", 10, (args, next) => {
        if (isEnabledGetter()) {
          next(args);
          return true;
        } else {
          return next(args);
        }
      });
      razorModSdk.hookFunction("ChatRoomAllowItem", 10, (args, next) => {
        if (isEnabledGetter()) {
          // do nothing
        } else {
          return next(args);
        }
      });
    },
    onUpdate() {
      if (Player) ChatRoomRefreshChatSettings()
    }
  },
  {
    name: 'skip_inventory_group_block',
    description: '无视遮挡',
    init(isEnabledGetter) {
      razorModSdk.hookFunction("InventoryGroupIsBlocked", 10, (args, next) => {
        if (isEnabledGetter()) {
          next(args);
          return false;
        } else {
          return next(args);
        }
      });
      razorModSdk.hookFunction("InventoryGroupIsAvailable", 10, (args, next) => {
        if (isEnabledGetter()) {
          next(args);
          return null;
        } else {
          return next(args);
        }
      });
    },
  },
  {
    name: 'bypass_distance_limit',
    description: '可以忽略距离限制',
    init(isEnabledGetter) {
      razorModSdk.hookFunction("InventoryIsBlockedByDistance", 10, (args, next) => {
        if (isEnabledGetter()) {
          next(args);
          return false;
        } else {
          return next(args);
        }
      });
      razorModSdk.hookFunction("InventoryPrerequisiteMessage", 10, (args, next) => {
        if (isEnabledGetter()) {
          next(args);
          return '';
        } else {
          return next(args);
        }
      });
    }
  },
  {
    name: 'struggle_force',
    description: '瞬间完成挣扎',
    init(isEnabledGetter) {
      razorModSdk.hookFunction("StruggleProgressCheckEnd", 10, (args, next) => {
        if (isEnabledGetter()) {
          StruggleProgress = 110;
        }
        return next(args);
      });
    }
  },
  {
    name: 'no_blind',
    description: '解除失明效果',
    init(isEnabledGetter) {
      razorModSdk.hookFunction("Player.GetBlindLevel", 10, (args, next) => {
        if (isEnabledGetter()) {
          next(args);
          return 0;
        } else {
          return next(args);
        }
      });
      razorModSdk.hookFunction("Player.GetDeafLevel", 10, (args, next) => {
        if (isEnabledGetter()) {
          next(args);
          return 0;
        } else {
          return next(args);
        }
      });
    }
  },
  {
    name: 'interact_monkey',
    description: '解除触碰限制',
    init(isEnabledGetter) {
      razorModSdk.hookFunction("Player.CanInteract", 10, (args, next) => {
        if (isEnabledGetter()) {
          next(args);
          return true;
        } else {
          return next(args);
        }
      });
      razorModSdk.hookFunction("Player.IsRestrained", 10, (args, next) => {
        if (isEnabledGetter()) {
          next(args);
          return false;
        } else {
          return next(args);
        }
      });
    }
  },
  {
    name: 'map_visible_all',
    description: '地图模式无限视距',
    init(isEnabledGetter) {
      razorModSdk.hookFunction("ChatRoomMapViewCharacterIsVisible", 10, (args, next) => {
        if (isEnabledGetter()) {
          next(args);
          return true;
        } else {
          return next(args);
        }
      });
      razorModSdk.hookFunction("ChatRoomMapViewCharacterIsHearable", 10, (args, next) => {
        if (isEnabledGetter()) {
          next(args);
          return false;
        } else {
          return next(args);
        }
      });
      razorModSdk.hookFunction("ChatRoomMapViewCalculatePerceptionMasks", 10, (args, next) => {
        if (isEnabledGetter()) {
          if (!Player.MapData) {
            return;
          }
          ChatRoomMapViewVisibilityMask.fill(true);
        } else {
          return next(args);
        }
      });
    }
  },
  {
    name: 'map_no_tile',
    description: '地图模式穿墙',
    init(isEnabledGetter) {
      razorModSdk.hookFunction("ChatRoomMapViewCanEnterTile", 10, (args, next) => {
        if (isEnabledGetter()) {
          next(args);
          return 1;
        } else {
          return next(args);
        }
      });
    }
  },
]

class UtilRemoveLimitModule implements AbstractModule {

  initialized: boolean = false;
  enabled: {[k:string]: boolean} = Object.fromEntries(switchEntries.map(entry => [entry.name, false]));

  init() {
  }

  initAfterLogin() {
    if (this.initialized) {
      return;
    }
    this.initialized = true;

    for (const switchEntry of switchEntries) {
      switchEntry.init(() => this.enabled[switchEntry.name]);
      if (switchEntry.onUpdate) {
        switchEntry.onUpdate(this.enabled[switchEntry.name]);
      }
    }
  }

  onUpdate(name: string) {
    this.saveConfig();
    switchEntries.find(entry => entry.name === name)?.onUpdate?.(this.enabled[name]);
  }

  loadConfig() {
    const localStorageElement = localStorage['razorwings.util_remove_limit'];
    if (localStorageElement) {
      const config = JSON.parse(localStorageElement);
      for (const switchEntry of switchEntries) {
        this.enabled[switchEntry.name] = config[switchEntry.name] || false;
        if (this.enabled[switchEntry.name] && switchEntry.onUpdate) {
          switchEntry.onUpdate(this.enabled[switchEntry.name]);
        }
      }
    } else {
      this.saveConfig();
    }
  }

  saveConfig() {
    localStorage['razorwings.util_remove_limit'] = JSON.stringify(this.enabled);
  }
}

export default new UtilRemoveLimitModule();
