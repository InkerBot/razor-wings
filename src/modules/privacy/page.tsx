import {useState} from "react";
import {useTranslation} from "react-i18next";
import module from "@/modules/privacy/module.ts";
import PlayerSelector from "@/components/PlayerSelector";
import Button from "@/components/Button";
import {FormSectionTitle} from "@/components/Form";
import {TextInput} from "@/components/FieldControls";
import ToggleRow, {ToggleRowGroup} from "@/components/ToggleRow";

export default function PrivacyPage() {
  const {t} = useTranslation();
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
        {t('privacy.disableWceBeepMetadata')}
      </ToggleRow>
      <ToggleRow card checked={settings.disableWceReport}
                 onChange={checked => handleSettingChange("disableWceReport", checked)}>
        {t('privacy.disableWceReport')}
      </ToggleRow>
    </ToggleRowGroup>

    <FormSectionTitle>BCX</FormSectionTitle>
    <ToggleRowGroup>
      <ToggleRow card checked={settings.disableBcxBeepFingerPrint}
                 onChange={checked => handleSettingChange("disableBcxBeepFingerPrint", checked)}>
        {t('privacy.disableBcxBeepFingerPrint')}
      </ToggleRow>
      <ToggleRow card checked={settings.disableBcxMessage}
                 onChange={checked => handleSettingChange("disableBcxMessage", checked)}>
        {t('privacy.disableBcxMessage')}
      </ToggleRow>
    </ToggleRowGroup>

    <FormSectionTitle>Echo Extension</FormSectionTitle>
    <ToggleRowGroup>
      <ToggleRow card checked={settings.disableEchoMessage}
                 onChange={checked => handleSettingChange("disableEchoMessage", checked)}>
        {t('privacy.disableEchoMessage')}
      </ToggleRow>
    </ToggleRowGroup>

    <FormSectionTitle>LSCG</FormSectionTitle>
    <ToggleRowGroup>
      <ToggleRow card checked={settings.disableLscgMessage}
                 onChange={checked => handleSettingChange("disableLscgMessage", checked)}>
        {t('privacy.disableLscgMessage')}
      </ToggleRow>
    </ToggleRowGroup>

    <FormSectionTitle>MPA</FormSectionTitle>
    <ToggleRowGroup>
      <ToggleRow card checked={settings.disableMpaMessage}
                 onChange={checked => handleSettingChange("disableMpaMessage", checked)}>
        {t('privacy.disableMpaMessage')}
      </ToggleRow>
    </ToggleRowGroup>

    <FormSectionTitle>{t('privacy.global')}</FormSectionTitle>
    <ToggleRowGroup>
      <ToggleRow card checked={settings.disableAllActions}
                 onChange={checked => handleSettingChange("disableAllActions", checked)}>
        {t('privacy.disableAllActions')}
      </ToggleRow>
    </ToggleRowGroup>

    <div>
      <p>{t('privacy.hiddenMods')}</p>
      <div className="rw-field-row">
        <TextInput
          type="text"
          value={newModName}
          onChange={(e) => setNewModName(e.target.value)}
          placeholder={t('privacy.hiddenModPlaceholder')}
        />
        <Button onClick={addModToHiddenMods} disabled={!newModName}>
          {t('privacy.addHiddenMod')}
        </Button>
      </div>
      {hiddenMods.length > 0 ? (
        <ul className="rw-plain-list">
          {hiddenMods.map(mod => (
            <li key={mod} className="rw-list-row">
              {mod}
              <Button size="small" variant="danger" onClick={() => removeFromHiddenMods(mod)}>{t('common.delete')}</Button>
            </li>
          ))}
        </ul>
      ) : (
        <p>{t('privacy.noHiddenMods')}</p>
      )}
    </div>
    <hr/>

    <div>
      <p>{t('privacy.whitelist')}</p>
      <div className="rw-field-row">
        <PlayerSelector characterId={selectedPlayer?.CharacterID} onChange={setSelectedPlayer}/>
        <Button onClick={addSelectedPlayerToWhitelist} disabled={!selectedPlayer}>
          {t('privacy.addSelectedPlayer')}
        </Button>
      </div>
      {whitelistNumbers.length > 0 ? (
        <ul className="rw-plain-list">
          {whitelistNumbers.map(num => (
            <li key={num} className="rw-list-row">
              {num}
              <Button size="small" variant="danger" onClick={() => removeFromWhitelist(num)}>{t('common.delete')}</Button>
            </li>
          ))}
        </ul>
      ) : (
        <p>{t('privacy.emptyWhitelist')}</p>
      )}
    </div>

  </>)
}
