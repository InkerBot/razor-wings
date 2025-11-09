import type AbstractApplier from "./AbstractApplier.ts";
import historyModule from "../../modules/history/module.ts";
import {type ApplyConfig, configDisabledGroup} from "./config.ts";

export default {
  async apply(target: Character, appearance: AppearanceBundle, config?: ApplyConfig) {
    if (target !== Player) {
      throw new Error("ForceSyncSelfApplier can only be applied to Player");
    }

    historyModule.pushReason({ text: "razor-wings editor" }, () => {
      Player.Appearance = [
        ...Player.Appearance.filter(it => {
          if (configDisabledGroup(config, it.Asset.Group)) {
            return true;
          }
          if (it.Asset.Group.AllowNone && !appearance.some(newIt => newIt.Group === it.Asset.Group.Name)) {
            return false;
          }
          return !!(config?.disableRemove)
        }),
        ...appearance.map(it => ServerBundledItemToAppearanceItem(target.AssetFamily, it))
          .filter(it => it && !configDisabledGroup(config, it.Asset.Group))
      ]

      ChatRoomCharacterUpdate(target)
      CharacterAppearanceResolveSync(target, target.Appearance);
      CharacterLoadEffect(target);
      CharacterRefresh(target);
    });
  }
} as AbstractApplier;
