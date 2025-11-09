import type AbstractApplier from "./AbstractApplier.ts";
import {type ApplyConfig, configDisabledGroup} from "./config.ts";

export default {
  async apply(target: Character, appearance: AppearanceBundle, config?: ApplyConfig) {
    const updatedGroups = appearance.map(it => it.Group)
    for (const item of target.Appearance.filter(it => !updatedGroups.includes(it.Asset?.Group?.Name))) {
      if (!config?.disableRemove && item.Asset.Group.AllowNone && !configDisabledGroup(config, item.Asset.Group)) {
        InventoryRemove(target, item.Asset.Group.Name, false)
      }
    }

    appearance.forEach(it =>{
      if (configDisabledGroup(config, it.Group)) return;
      InventoryWear(target, it.Name, it.Group, it.Color, it.Difficulty, Player.ID, it.Craft, false)
    });

    for (const it of appearance.filter(it => it.Property)) {
      if (configDisabledGroup(config, it.Group)) continue;
      target.Appearance.filter(asset => asset.Asset?.Group?.Name === it.Group)
        .forEach(item => item.Property = it.Property)
    }

    ChatRoomCharacterUpdate(target)
    CharacterAppearanceResolveSync(target, target.Appearance);
    CharacterLoadEffect(target);
    CharacterRefresh(target);
  }
} as AbstractApplier;
