import {useState} from "react";
import Button from "@/components/Button";
import {InlineLabel, TextInput} from "@/components/FieldControls";
import ToggleRow from "@/components/ToggleRow";

export default function UtilRemoveSubmissivePage() {
  const [memberNumber, setMemberNumber] = useState<string>('');
  const [removeListOnly, setRemoveListOnly] = useState<boolean>(false);

  return (<>
    <InlineLabel>
      角色ID:
      <TextInput type="number" value={memberNumber} onChange={e => setMemberNumber(e.target.value)}/>
    </InlineLabel>
    <ToggleRow checked={removeListOnly} onChange={setRemoveListOnly}>是否仅移除 SubmissionList</ToggleRow>
    <p>
      如果勾选了 仅移除 SubmissionList，则只会从 Player.SubmissivesList 中移除奴隶，实际上不会解除关系。在下次见到时会再次加上。
    </p>
    <Button onClick={() => {
      const number = parseInt(memberNumber);
      if (removeListOnly) {
        ServerSend("AccountOwnership", {MemberNumber: number, Action: "Release"});
      }
      Player.SubmissivesList.delete(number);
      ServerPlayerRelationsSync();
    }}>run</Button>
  </>)
}
