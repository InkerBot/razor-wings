import {useEffect, useState} from "react";
import PlayerSelector from "../../components/PlayerSelector.tsx";
import module from "./module.ts";

export default function UtilUnlockPage() {
  const [tiggerTextEnable, setTiggerTextEnable] = useState(module.tiggerTextEnable);
  const [tiggerText, setTiggerText] = useState(module.tiggerText);

  const [character, setCharacter] = useState<Character | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    module.tiggerTextEnable = tiggerTextEnable;
    module.saveConfig();
  }, [tiggerTextEnable]);
  useEffect(() => {
    module.tiggerText = tiggerText;
    module.saveConfig();
  }, [tiggerText]);

  const onClick = () => {
    if (character == null) {
      setMessage("请先选择一个角色");
      return;
    }

    module.run(character);

    setMessage(`已解锁角色 ${character.Nickname ?? character.Name} (${character.Name}) 的所有拘束`);
    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  return <>
    <div>
      <p>解锁角色的所有拘束</p>
      {message && <p>{message}</p>}
      {character && (
        <p>当前选择的角色: {character.Nickname ?? character.Name} ({character.Name})</p>
      )}
      <PlayerSelector onChange={setCharacter} characterId={character?.CharacterID}/>
      <button onClick={onClick} disabled={!character}>解锁</button>
    </div>
    <div>
      <label>
        <input type="checkbox" checked={tiggerTextEnable} onChange={e => setTiggerTextEnable(e.target.checked)}/>
        启用触发文本
      </label>
    </div>
    <div>
      <label>
        触发文本:
        <input
          type="text"
          value={tiggerText}
          onChange={e => setTiggerText(e.target.value)}
          placeholder="输入触发文本"
        />
      </label>
    </div>
  </>
}
