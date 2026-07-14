import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import PlayerSelector from "@/components/PlayerSelector.tsx";
import module from "@/modules/util_lock/module.ts";
import Button from "@/components/Button";
import {InlineLabel, TextInput} from "@/components/FieldControls";
import ToggleRow from "@/components/ToggleRow";

export default function UtilLockPage() {
  const {t} = useTranslation();
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
      setMessage(t('lock.selectCharacterFirst'));
      return;
    }

    module.run(character, Player.MemberNumber);

    setMessage(t('lock.success', {name: character.Nickname ?? character.Name, id: character.Name}));
    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  return <>
    <div>
      <p>{t('lock.description')}</p>
      {message && <p>{message}</p>}
      {character && (
        <p>{t('lock.selectedCharacter', {name: character.Nickname ?? character.Name, id: character.Name})}</p>
      )}
      <PlayerSelector onChange={setCharacter} characterId={character?.CharacterID}/>
      <Button onClick={onClick} disabled={!character}>{t('lock.action')}</Button>
    </div>
    <div>
      <ToggleRow checked={tiggerTextEnable} onChange={setTiggerTextEnable}>{t('lock.enableTriggerText')}</ToggleRow>
    </div>
    <div>
      <InlineLabel>
        {t('lock.triggerText')}
        <TextInput
          type="text"
          value={tiggerText}
          onChange={e => setTiggerText(e.target.value)}
          placeholder={t('lock.triggerPlaceholder')}
        />
      </InlineLabel>
    </div>
  </>
}
