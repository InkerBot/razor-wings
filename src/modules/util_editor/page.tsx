import React from "react";
import PlayerAppearanceEditor from "./PlayerAppearanceEditor.tsx";
import PlayerSelector from "../../components/PlayerSelector.tsx";
import UpdatePropertyApplier from "../../util/applier/UpdatePropertyApplier.ts";
import {deserializeAppearance, serializeAppearance} from "../../util/appearanceCodec.ts";
import ForceSyncSelfApplier from "../../util/applier/ForceSyncSelfApplier.ts";
import {razorIsPro} from "../../util/pro.ts";
import {sendActivityText} from "../../util/message.ts";
import type {ApplyConfig} from "../../util/applier/config.ts";

export default function UtilEditorPage() {
  const [applyConfig, setApplyConfig] = React.useState<ApplyConfig>({
    disableItem: false,
    disableCloth: false,
    disableUnderwear: false,
    disableCosplay: false,
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
    <div style={{
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0
    }}>
      <div className="editor-page-editor" style={{
        flex: 1,
        minHeight: 0,
        overflow: 'hidden'
      }}>
        <PlayerAppearanceEditor value={value} onChange={setValue}/>
      </div>
      <div className="editor-page-buttons" style={{
        display: 'flex',
        flexShrink: 0
      }}>
        {razorIsPro() && <PlayerSelector characterId={character?.CharacterID} onChange={setCharacter}/>}
        <label>
          <input type="checkbox" checked={applyConfig.disableItem} onChange={(e) => updateApplierConfig({
            disableItem: e.target.checked
          })}/>
          禁用物品
        </label>
        <label>
          <input type="checkbox" checked={applyConfig.disableCloth} onChange={(e) => updateApplierConfig({
            disableCloth: e.target.checked
          })}/>
          禁用衣服
        </label>
        <label>
          <input type="checkbox" checked={applyConfig.disableUnderwear} onChange={(e) => updateApplierConfig({
            disableUnderwear: e.target.checked
          })}/>
          禁用内衣
        </label>
        <label>
          <input type="checkbox" checked={applyConfig.disableCosplay} onChange={(e) => updateApplierConfig({
            disableCosplay: e.target.checked
          })}/>
          禁用角色
        </label>
        <button onClick={() => setValue(serializeAppearance(character))} disabled={!character}>Load</button>
        <button onClick={() => setValue(JSON.stringify(JSON.parse(value), null, 2))}>Format</button>
        <button disabled={!character || applying} onClick={applyCharacter}>{applying ? 'applying' : 'Apply'}</button>
      </div>
    </div>
  )
}
