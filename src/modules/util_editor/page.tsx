import React from "react";
import PlayerAppearanceEditor from "@/modules/util_editor/PlayerAppearanceEditor.tsx";
import PlayerSelector from "@/components/PlayerSelector.tsx";
import Button from "@/components/Button";
import ToggleRow from "@/components/ToggleRow";
import UpdatePropertyApplier from "@/util/applier/UpdatePropertyApplier.ts";
import {deserializeAppearance, serializeAppearance} from "@/util/appearanceCodec.ts";
import ForceSyncSelfApplier from "@/util/applier/ForceSyncSelfApplier.ts";
import {razorIsPro} from "@/util/pro.ts";
import {sendActivityText} from "@/util/message.ts";
import type {ApplyConfig} from "@/util/applier/config.ts";

export default function UtilEditorPage() {
  const [applyConfig, setApplyConfig] = React.useState<ApplyConfig>({
    disableItem: false,
    disableCloth: false,
    disableUnderwear: false,
    disableCosplay: false,
    disableRemove: false
  });
  const [value, setValue] = React.useState('[]');
  const [character, setCharacter] = React.useState<Character | null>(Player);
  const [applying, setApplying] = React.useState(false);

  const updateApplierConfig = (config: Partial<ApplyConfig>) => {
    setApplyConfig(prev => {
      return {...prev, ...config};
    });
  }

  const applyCharacter = () => {
    setApplying(true);
    (async () => {
      if (!razorIsPro()) {
        if (character !== Player) {
          ToastManager.error("edit others is not supported.");
          return;
        }
        await sendActivityText(`${Player.Nickname || Player.Name} 编辑了 ${character.Nickname || character.Name} 的外观代码。`);
      }
      const applier = character.CharacterID === Player.CharacterID ? ForceSyncSelfApplier : UpdatePropertyApplier;
      const appearance = deserializeAppearance(value);
      await applier.apply(character, appearance, applyConfig);
    })().finally(() => setApplying(false))
      .catch(e => {
        console.error("Failed to apply appearance:", e);
        ToastManager.error("[RazorWings] Failed to apply appearance: \n" + e.message);
      });
  };

  return (
    <div className="flex h-full min-h-[0] w-full flex-col">
      <div className="min-h-[0] flex-1 overflow-hidden">
        <PlayerAppearanceEditor value={value} onChange={setValue}/>
      </div>
      <div className="flex shrink-0 flex-wrap gap-[4px]">
        {razorIsPro() && <PlayerSelector characterId={character?.CharacterID} onChange={setCharacter}/>}
        <ToggleRow className="w-auto min-w-[120px] flex-none" checked={applyConfig.disableItem}
                   onChange={disableItem => updateApplierConfig({disableItem})}>禁用物品</ToggleRow>
        <ToggleRow className="w-auto min-w-[120px] flex-none" checked={applyConfig.disableCloth}
                   onChange={disableCloth => updateApplierConfig({disableCloth})}>禁用衣服</ToggleRow>
        <ToggleRow className="w-auto min-w-[120px] flex-none" checked={applyConfig.disableUnderwear}
                   onChange={disableUnderwear => updateApplierConfig({disableUnderwear})}>禁用内衣</ToggleRow>
        <ToggleRow className="w-auto min-w-[120px] flex-none" checked={applyConfig.disableCosplay}
                   onChange={disableCosplay => updateApplierConfig({disableCosplay})}>禁用角色</ToggleRow>
        <ToggleRow className="w-auto min-w-[130px] flex-none" checked={applyConfig.disableRemove}
                   onChange={disableRemove => updateApplierConfig({disableRemove})}>不移除现有装扮</ToggleRow>
        <Button onClick={() => setValue(serializeAppearance(character))} disabled={!character}>Load</Button>
        <Button onClick={() => setValue(JSON.stringify(JSON.parse(value), null, 2))}>Format</Button>
        <Button disabled={!character || applying} onClick={applyCharacter}>{applying ? 'applying' : 'Apply'}</Button>
      </div>
    </div>
  )
}
