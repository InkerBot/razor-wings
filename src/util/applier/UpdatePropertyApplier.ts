import type AbstractApplier from "./AbstractApplier.ts";

export default {
  async apply(target: Character, appearance: AppearanceBundle) {
    const updatedGroups = appearance.map(it => it.Group)
    for (const item of target.Appearance.filter(it => !updatedGroups.includes(it.Asset?.Group?.Name))) {
      if (item.Asset.Group.AllowNone) {
        InventoryRemove(target, item.Asset.Group.Name)
      }
    }

    appearance.forEach(it =>
      InventoryWear(target, it.Name, it.Group, it.Color, it.Difficulty, Player.ID, it.Craft)
    );

    for (const it of appearance.filter(it => it.Property)) {
      target.Appearance.filter(asset => asset.Asset?.Group?.Name === it.Group)
        .forEach(item => item.Property = it.Property)
    }

    ChatRoomCharacterUpdate(target)
    CharacterAppearanceResolveSync(target, target.Appearance);
    CharacterLoadEffect(target);
    CharacterRefresh(target);
  }
} as AbstractApplier;
