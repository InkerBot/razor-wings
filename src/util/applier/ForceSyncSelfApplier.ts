import type AbstractApplier from "./AbstractApplier.ts";
import historyModule from "../../modules/history/module.ts";

export default {
  async apply(target: Character, appearance: AppearanceBundle) {
    if (target !== Player) {
      throw new Error("ForceSyncSelfApplier can only be applied to Player");
    }

    historyModule.pushReason({ text: "razor-wings editor" }, () => {
      Player.Appearance = [
        ...Player.Appearance.filter(it => !it.Asset.Group.AllowNone && !appearance.some(newIt => newIt.Group === it.Asset.Group.Name)),
        ...appearance.map(it => ServerBundledItemToAppearanceItem(target.AssetFamily, it))
          .filter(it => it)
      ]

      ChatRoomCharacterUpdate(target)
      CharacterAppearanceResolveSync(target, target.Appearance);
      CharacterLoadEffect(target);
      CharacterRefresh(target);
    });
  }
} as AbstractApplier;
