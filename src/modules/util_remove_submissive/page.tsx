import {useState} from "react";
import {useTranslation} from "react-i18next";
import Button from "@/components/Button";
import {InlineLabel, TextInput} from "@/components/FieldControls";
import ToggleRow from "@/components/ToggleRow";

export default function UtilRemoveSubmissivePage() {
  const {t} = useTranslation();
  const [memberNumber, setMemberNumber] = useState<string>('');
  const [removeListOnly, setRemoveListOnly] = useState<boolean>(false);

  return (<>
    <InlineLabel>
      {t('removeSubmissive.characterId')}
      <TextInput type="number" value={memberNumber} onChange={e => setMemberNumber(e.target.value)}/>
    </InlineLabel>
    <ToggleRow checked={removeListOnly} onChange={setRemoveListOnly}>{t('removeSubmissive.removeListOnly')}</ToggleRow>
    <p>
      {t('removeSubmissive.description')}
    </p>
    <Button onClick={() => {
      const number = parseInt(memberNumber);
      if (removeListOnly) {
        ServerSend("AccountOwnership", {MemberNumber: number, Action: "Release"});
      }
      Player.SubmissivesList.delete(number);
      ServerPlayerRelationsSync();
    }}>{t('common.run')}</Button>
  </>)
}
