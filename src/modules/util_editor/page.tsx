import React from "react";
import PlayerAppearanceEditor from "./PlayerAppearanceEditor.tsx";
import PlayerSelector from "../../components/PlayerSelector.tsx";
import UpdatePropertyApplier from "../../util/applier/UpdatePropertyApplier.ts";
import {deserializeAppearance, serializeAppearance} from "../../util/appearanceCodec.ts";
import ForceSyncSelfApplier from "../../util/applier/ForceSyncSelfApplier.ts";
import {razorIsPro} from "../../util/pro.ts";
import {sendActivityText} from "../../util/message.ts";

export default function UtilEditorPage() {
  const [value, setValue] = React.useState('[]');
  const [character, setCharacter] = React.useState<Character | null>(null);
  const [applying, setApplying] = React.useState(false);

  const applyCharacter = () => {
    setApplying(true);
    (async () => {
      if (!razorIsPro()) {
        await sendActivityText(`${Player.Nickname || Player.Name} 编辑了 ${character.Nickname || character.Name} 的外观代码。`);
      }
      const applier = character.CharacterID === Player.CharacterID ? ForceSyncSelfApplier : UpdatePropertyApplier;
      const appearance = deserializeAppearance(value);
      await applier.apply(character, appearance);
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
        <PlayerSelector characterId={character?.CharacterID} onChange={setCharacter}/>
        <button onClick={() => setValue(serializeAppearance(character))} disabled={!character}>Load</button>
        <button onClick={() => setValue(JSON.stringify(JSON.parse(value), null, 2))}>Format</button>
        <button disabled={!character || applying} onClick={applyCharacter}>{applying ? 'applying' : 'Apply'}</button>
      </div>
    </div>
  )
}
