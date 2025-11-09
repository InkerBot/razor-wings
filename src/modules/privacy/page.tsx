import {useState} from "react";
import module from "./module.ts";
import PlayerSelector from "../../components/PlayerSelector";

export default function PrivacyPage() {
  const [settings, setSettings] = useState({
    disableWceBeepMetadata: module.disableWceBeepMetadata || false,
    disableWceReport: module.disableWceReport || false,
    disableBcxBeepFingerPrint: module.disableBcxBeepFingerPrint || false,
    disableBcxMessage: module.disableBcxMessage || false,
    disableEchoMessage: module.disableEchoMessage || false,
    disableLscgMessage: module.disableLscgMessage || false,
    disableMpaMessage: module.disableMpaMessage || false,
    disableAllActions: module.disableAllActions || false,
  });

  const [hiddenMods, setHiddenMods] = useState<string[]>(module.hiddenMods || ['RazorWings']);
  const [newModName, setNewModName] = useState<string>("");
  const [whitelistNumbers, setWhitelistNumbers] = useState<number[]>(module.whitelist || []);
  const [selectedPlayer, setSelectedPlayer] = useState<Character | undefined>(undefined);

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({...prev, [key]: value}));
    module[key] = value;
    module.saveConfig();
  };

  const addSelectedPlayerToWhitelist = () => {
    if (selectedPlayer && selectedPlayer.MemberNumber) {
      if (!whitelistNumbers.includes(selectedPlayer.MemberNumber)) {
        const newWhitelist = [...whitelistNumbers, selectedPlayer.MemberNumber];
        setWhitelistNumbers(newWhitelist);
        module.whitelist = newWhitelist;
        module.saveConfig();
      }
    }
  };

  const removeFromWhitelist = (memberNumber: number) => {
    const newWhitelist = whitelistNumbers.filter(num => num !== memberNumber);
    setWhitelistNumbers(newWhitelist);
    module.whitelist = newWhitelist;
    module.saveConfig();
  };

  const addModToHiddenMods = () => {
    if (newModName && !hiddenMods.includes(newModName)) {
      const newHiddenMods = [...hiddenMods, newModName];
      setHiddenMods(newHiddenMods);
      module.hiddenMods = newHiddenMods;
      module.saveConfig();
      setNewModName(""); // 清空输入框
    }
  };

  const removeFromHiddenMods = (modName: string) => {
    const newHiddenMods = hiddenMods.filter(mod => mod !== modName);
    setHiddenMods(newHiddenMods);
    module.hiddenMods = newHiddenMods;
    module.saveConfig();
  };

  return (<>
    WCE
    <div>
      <label>
        <input
          type="checkbox"
          checked={settings.disableWceBeepMetadata}
          onChange={(e) => handleSettingChange("disableWceBeepMetadata", e.target.checked)}
        />
        禁用 WCE Beep 元数据（防止 WCE 在 Beep 消息中添加额外信息）
      </label>
    </div>

    <div>
      <label>
        <input
          type="checkbox"
          checked={settings.disableWceReport}
          onChange={(e) => handleSettingChange("disableWceReport", e.target.checked)}
        />
        禁用 WCE 报告（阻止 WCE 隐藏消息的发送）
      </label>
    </div>

    <hr/>
    BCX
    <div>
      <label>
        <input
          type="checkbox"
          checked={settings.disableBcxBeepFingerPrint}
          onChange={(e) => handleSettingChange("disableBcxBeepFingerPrint", e.target.checked)}
        />
        禁用 BCX Beep 指纹（阻止 BCX Leash 和 BCX 类型的 Beep）
      </label>
    </div>

    <div>
      <label>
        <input
          type="checkbox"
          checked={settings.disableBcxMessage}
          onChange={(e) => handleSettingChange("disableBcxMessage", e.target.checked)}
        />
        限制 BCX 消息（仅向白名单中的玩家发送 BCX 消息）
      </label>
    </div>

    <hr/>
    Echo Extension
    <div>
      <label>
        <input
          type="checkbox"
          checked={settings.disableEchoMessage}
          onChange={(e) => handleSettingChange("disableEchoMessage", e.target.checked)}
        />
        禁用 Echo 扩展消息（阻止 Echo 扩展消息的发送）
      </label>
    </div>

    <hr/>
    LSCG
    <div>
      <label>
        <input
          type="checkbox"
          checked={settings.disableLscgMessage}
          onChange={(e) => handleSettingChange("disableLscgMessage", e.target.checked)}
        />
        禁用 LSCG 消息（阻止 LSCG 消息的发送）
      </label>
    </div>

    <hr/>
    MPA
    <div>
      <label>
        <input
          type="checkbox"
          checked={module.disableMpaMessage}
          onChange={(e) => handleSettingChange("disableMpaMessage", e.target.checked)}
        />
        禁用 MPA 消息（阻止 MPA 消息的发送）
      </label>
    </div>
    <hr/>

    <div>
      <label>
        <input
          type="checkbox"
          checked={settings.disableAllActions}
          onChange={(e) => handleSettingChange("disableAllActions", e.target.checked)}
        />
        禁用所有动作（阻止所有动作的发送）
      </label>
    </div>

    <div>
      隐藏的Mod列表（在WCE报告中隐藏）
      <div>
        <input
          type="text"
          value={newModName}
          onChange={(e) => setNewModName(e.target.value)}
          placeholder="输入Mod名称"
        />
        <button onClick={addModToHiddenMods} disabled={!newModName}>
          添加Mod到隐藏列表
        </button>
      </div>
      {hiddenMods.length > 0 ? (
        <ul style={{margin: 0, padding: 0, listStyle: 'none'}}>
          {hiddenMods.map(mod => (
            <li key={mod}>
              {mod}
              <button onClick={() => removeFromHiddenMods(mod)}>删除</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>没有隐藏的Mod</p>
      )}
    </div>
    <hr/>

    <div>
      消息白名单
      <div>
        <PlayerSelector characterId={selectedPlayer.CharacterID} onChange={setSelectedPlayer}/>
        <button onClick={addSelectedPlayerToWhitelist} disabled={!selectedPlayer}>
          添加选中玩家到白名单
        </button>
      </div>
      {whitelistNumbers.length > 0 ? (
        <ul style={{margin: 0, padding: 0, listStyle: 'none'}}>
          {whitelistNumbers.map(num => (
            <li key={num}>
              {num}
              <button onClick={() => removeFromWhitelist(num)}>删除</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>白名单为空</p>
      )}
    </div>

  </>)
}
