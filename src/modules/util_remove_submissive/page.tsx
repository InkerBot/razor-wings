import {useState} from "react";

export default function UtilRemoveSubmissivePage() {
  const [memberNumber, setMemberNumber] = useState<string>('');
  const [removeListOnly, setRemoveListOnly] = useState<boolean>(false);

  return (<>
    <label>
      角色ID:
      <input type="number" value={memberNumber} onChange={e => setMemberNumber(e.target.value)} />
    </label>
    <label className="toggle-row">
      <span>是否仅移除 SubmissionList</span>
      <span className="toggle-switch">
        <input type="checkbox" checked={removeListOnly} onChange={e => setRemoveListOnly(e.target.checked)}/>
        <span className="toggle-slider"/></span>
    </label>
    <p>
      如果勾选了 仅移除 SubmissionList，则只会从 Player.SubmissivesList 中移除奴隶，实际上不会解除关系。在下次见到时会再次加上。
    </p>
    <button onClick={() => {
      const number = parseInt(memberNumber);
      if (removeListOnly) {
        ServerSend("AccountOwnership", { MemberNumber: number, Action: "Release" });
      }
      Player.SubmissivesList.delete(number);
      ServerPlayerRelationsSync();
    }}>run</button>
  </>)
}
