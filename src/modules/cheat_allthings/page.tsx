import {useState} from "react";
import {useTranslation} from "react-i18next";
import Button from "@/components/Button";

export default function CheatAllThings() {
  const {t} = useTranslation();
  const [message, setMessage] = useState<string[]>([]);

  const appendMessage = (msg: string) => {
    setMessage(prev => [...prev, msg]);
  }

  const onClick = () => {
    appendMessage(t('cheatAllThings.getAppearance'))

    appendMessage(t('cheatAllThings.allSkills'))
    SkillProgress(Player, 'Bondage', 114514)
    SkillProgress(Player, 'SelfBondage', 114514)
    SkillProgress(Player, 'LockPicking', 114514)
    SkillProgress(Player, 'Evasion', 114514)
    SkillProgress(Player, 'Willpower', 114514)
    SkillProgress(Player, 'Infiltration', 114514)
    SkillProgress(Player, 'Dressage', 114514)

    appendMessage(t('cheatAllThings.money'))
    CharacterChangeMoney(Player, 1000000)

    appendMessage(t('cheatAllThings.sync'))
    ServerAccountUpdate.QueueData({Game: Player.Game}, true);
    ServerPlayerInventorySync()

    appendMessage(t('cheatAllThings.success'))
  }

  return <>
    <p>{t('cheatAllThings.title')}</p>
    {message.length == 0 ?
      <Button onClick={onClick}>{t('common.run')}</Button> :
      message.map((msg, index) => (
        <p key={index}>{msg}</p>
      ))}
  </>
}
