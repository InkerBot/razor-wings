import {sendActivityText} from "../../../util/message.ts";
import type {ApplyConfig} from "../../../util/applier/config.ts";
import UpdatePropertyApplier from "../../../util/applier/UpdatePropertyApplier.ts";

function ensureCharacter(input: Character | number): Character {
  if (typeof input === "number") {
    return ChatRoomCharacter.find(it => it.MemberNumber === input);
  }
  return input;
}

function ensureMemberNumber(input: Character | number): number {
  if (typeof input === "number") {
    return input;
  }
  return input.MemberNumber;
}

const characterContext = new WeakMap<Character, { [k: string]: unknown }>();

export default {
  // get character info start

  getName(characterRaw: Character | number): string {
    const character = ensureCharacter(characterRaw);
    return character?.Name
  },

  getNickname(characterRaw: Character | number): string {
    const character = ensureCharacter(characterRaw);
    return character?.Nickname || character?.Name;
  },

  // color

  getRandomColor() {
    const colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"];
    return colors[Math.floor(Math.random() * colors.length)];
  },

  getCharacterColor(characterRaw: Character | number): string {
    const character = ensureCharacter(characterRaw);
    const hairFront = InventoryGet(character, "HairFront");
    const hairBack = InventoryGet(character, "HairBack");

    let itemColor: string|string[]|undefined;
    if (hairFront && hairFront.Color) {
      itemColor = hairFront.Color;
    } else if (hairBack && hairBack.Color) {
      itemColor = hairBack.Color;
    }
    if (!itemColor) {
      itemColor = 'Default';
    } else if (Array.isArray(itemColor)) {
      itemColor = itemColor.filter(c => c !== 'Default');
      itemColor = (itemColor.length === 0) ? 'Default' : itemColor[0];
    }

    return itemColor;
  },

  // send message start

  sendChat(message: string) {
    ServerSend("ChatRoomChat", ChatRoomGenerateChatRoomChatMessage("Chat", message));
  },

  sendEmote(message: string) {
    ServerSend("ChatRoomChat", ChatRoomGenerateChatRoomChatMessage("Emote", message));
  },

  sendWhisper(characterRaw: Character | number, message: string) {
    const memberNumber = ensureMemberNumber(characterRaw);
    const data = ChatRoomGenerateChatRoomChatMessage("Whisper", message);
    data.Target = memberNumber;
    ServerSend("ChatRoomChat", data);
  },

  sendActivity(message: string) {
    sendActivityText(message)
  },

  // set kv start

  setStorage(characterRaw: Character | number, key: string, value: unknown) {
    const character = ensureCharacter(characterRaw);
    if (!character) return;
    let data = characterContext.get(character);
    if (!data) {
      data = {};
      characterContext.set(character, data);
    }
    data[key] = value;
  },

  getStorage(characterRaw: Character | number, key: string): unknown {
    const character = ensureCharacter(characterRaw);
    if (!character) return null;
    const data = characterContext.get(character);
    if (!data) return null;
    return data[key] || null;
  },

  // player item start

  forceSync(characterRaw: Character | number) {
    const character = ensureCharacter(characterRaw);
    if (!character) return;
    ChatRoomCharacterUpdate(character)
    CharacterAppearanceResolveSync(character, character.Appearance);
    CharacterLoadEffect(character);
    CharacterRefresh(character);
  },

  addAppearance(characterRaw: Character | number, appearance: AppearanceBundle) {
    const character = ensureCharacter(characterRaw);
    if (!character) return;

    appearance.forEach(it =>
      InventoryWear(character, it.Name, it.Group, it.Color, it.Difficulty, Player.ID, it.Craft)
    );
    for (const it of appearance.filter(it => it.Property)) {
      character.Appearance.filter(asset => asset.Asset?.Group?.Name === it.Group)
        .forEach(item => item.Property = it.Property)
    }
    this.forceSync(character);
  },

  removeAppearance(characterRaw: Character | number, groups: string[]) {
    const character = ensureCharacter(characterRaw);
    if (!character) return;

    for (const item of character.Appearance.filter(it => !groups.includes(it.Asset?.Group?.Name))) {
      InventoryRemove(character, item.Asset.Group.Name)
    }
    this.forceSync(character);
  },

  applyItem(characterRaw: Character | number, appearance: AppearanceBundle) {
    this.applyAppearance(characterRaw, appearance, {
      disableCloth: true,
      disableUnderwear: true,
      disableCosplay: true,
    });
  },

  applyAppearance(characterRaw: Character | number, appearance: AppearanceBundle, config?: ApplyConfig) {
    const character = ensureCharacter(characterRaw);
    if (!character) return;

    UpdatePropertyApplier.apply(character, appearance, config);
  },

  // player teleport

  teleport(characterRaw: Character | number, x: number, y: number) {
    const character = ensureCharacter(characterRaw);
    if (!character) return;
    ChatRoomMapViewTeleport(character, {X: x, Y: y});
  }
}
