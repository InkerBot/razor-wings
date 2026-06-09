import {useState} from "react";
import module from "@/modules/privacy/module.ts";
import PlayerSelector from "@/components/PlayerSelector";
import Button from "@/components/Button";
import {FormSectionTitle} from "@/components/Form";
import {TextInput} from "@/components/FieldControls";
import ToggleRow, {ToggleRowGroup} from "@/components/ToggleRow";

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
      setNewModName("");
    }
  };

  const removeFromHiddenMods = (modName: string) => {
    const newHiddenMods = hiddenMods.filter(mod => mod !== modName);
    setHiddenMods(newHiddenMods);
    module.hiddenMods = newHiddenMods;
    module.saveConfig();
  };

  return (<>
    <FormSectionTitle>WCE</FormSectionTitle>
    <ToggleRowGroup>
      <ToggleRow card checked={settings.disableWceBeepMetadata}
                 onChange={checked => handleSettingChange("disableWceBeepMetadata", checked)}>
        禁用 WCE Beep 元数据（防止 WCE 在 Beep 消息中添加额外信息）
      </ToggleRow>
      <ToggleRow card checked={settings.disableWceReport}
                 onChange={checked => handleSettingChange("disableWceReport", checked)}>
        禁用 WCE 报告（阻止 WCE 隐藏消息的发送）
      </ToggleRow>
    </ToggleRowGroup>

    <FormSectionTitle>BCX</FormSectionTitle>
    <ToggleRowGroup>
      <ToggleRow card checked={settings.disableBcxBeepFingerPrint}
                 onChange={checked => handleSettingChange("disableBcxBeepFingerPrint", checked)}>
        禁用 BCX Beep 指纹（阻止 BCX Leash 和 BCX 类型的 Beep）
      </ToggleRow>
      <ToggleRow card checked={settings.disableBcxMessage}
                 onChange={checked => handleSettingChange("disableBcxMessage", checked)}>
        限制 BCX 消息（仅向白名单中的玩家发送 BCX 消息）
      </ToggleRow>
    </ToggleRowGroup>

    <FormSectionTitle>Echo Extension</FormSectionTitle>
    <ToggleRowGroup>
      <ToggleRow card checked={settings.disableEchoMessage}
                 onChange={checked => handleSettingChange("disableEchoMessage", checked)}>
        禁用 Echo 扩展消息（阻止 Echo 扩展消息的发送）
      </ToggleRow>
    </ToggleRowGroup>

    <FormSectionTitle>LSCG</FormSectionTitle>
    <ToggleRowGroup>
      <ToggleRow card checked={settings.disableLscgMessage}
                 onChange={checked => handleSettingChange("disableLscgMessage", checked)}>
        禁用 LSCG 消息（阻止 LSCG 消息的发送）
      </ToggleRow>
    </ToggleRowGroup>

    <FormSectionTitle>MPA</FormSectionTitle>
    <ToggleRowGroup>
      <ToggleRow card checked={settings.disableMpaMessage}
                 onChange={checked => handleSettingChange("disableMpaMessage", checked)}>
        禁用 MPA 消息（阻止 MPA 消息的发送）
      </ToggleRow>
    </ToggleRowGroup>

    <FormSectionTitle>全局</FormSectionTitle>
    <ToggleRowGroup>
      <ToggleRow card checked={settings.disableAllActions}
                 onChange={checked => handleSettingChange("disableAllActions", checked)}>
        禁用所有动作（阻止所有动作的发送）
      </ToggleRow>
    </ToggleRowGroup>

    <div>
      <p>隐藏的Mod列表（在WCE报告中隐藏）</p>
      <div className="rw-field-row">
        <TextInput
          type="text"
          value={newModName}
          onChange={(e) => setNewModName(e.target.value)}
          placeholder="输入Mod名称"
        />
        <Button onClick={addModToHiddenMods} disabled={!newModName}>
          添加Mod到隐藏列表
        </Button>
      </div>
      {hiddenMods.length > 0 ? (
        <ul className="rw-plain-list">
          {hiddenMods.map(mod => (
            <li key={mod} className="rw-list-row">
              {mod}
              <Button size="small" variant="danger" onClick={() => removeFromHiddenMods(mod)}>删除</Button>
            </li>
          ))}
        </ul>
      ) : (
        <p>没有隐藏的Mod</p>
      )}
    </div>
    <hr/>

    <div>
      <p>消息白名单</p>
      <div className="rw-field-row">
        <PlayerSelector characterId={selectedPlayer?.CharacterID} onChange={setSelectedPlayer}/>
        <Button onClick={addSelectedPlayerToWhitelist} disabled={!selectedPlayer}>
          添加选中玩家到白名单
        </Button>
      </div>
      {whitelistNumbers.length > 0 ? (
        <ul className="rw-plain-list">
          {whitelistNumbers.map(num => (
            <li key={num} className="rw-list-row">
              {num}
              <Button size="small" variant="danger" onClick={() => removeFromWhitelist(num)}>删除</Button>
            </li>
          ))}
        </ul>
      ) : (
        <p>白名单为空</p>
      )}
    </div>

  </>)
}
