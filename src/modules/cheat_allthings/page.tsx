import {useState} from "react";

export default function CheatAllThings() {
  const [message, setMessage] = useState<string[]>([]);

  const appendMessage = (msg: string) => {
    setMessage(prev => [...prev, msg]);
  }

  const onClick = () => {
    appendMessage("RW: 获取所有外观...")
    AssetFemale3DCG.forEach((group) => group.Asset.forEach((asset: AssetDefinitionBase) => {
      InventoryAdd(Player, asset.Name, group.Group, false)
    }))

    appendMessage("RW: all skills...")
    SkillProgress(Player, 'Bondage', 114514)
    SkillProgress(Player, 'SelfBondage', 114514)
    SkillProgress(Player, 'LockPicking', 114514)
    SkillProgress(Player, 'Evasion', 114514)
    SkillProgress(Player, 'Willpower', 114514)
    SkillProgress(Player, 'Infiltration', 114514)
    SkillProgress(Player, 'Dressage', 114514)

    appendMessage("RW: money...")
    CharacterChangeMoney(Player, 1000000)

    appendMessage("RW: sync...")
    ServerAccountUpdate.QueueData({Game: Player.Game}, true);
    ServerPlayerInventorySync()

    appendMessage("RW: success")
  }

  return <>
    <p>获取所有物品</p>
    {message.length == 0 ?
      <button onClick={onClick}>run</button> :
      message.map((msg, index) => (
        <p key={index}>{msg}</p>
      ))}
  </>
}
