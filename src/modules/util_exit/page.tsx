import {useState} from "react";

export default function CheatAllThings() {
  const [message, setMessage] = useState<string[]>([]);

  const appendMessage = (msg: string) => {
    setMessage(prev => [...prev, msg]);
  }

  const onClick = () => {
    appendMessage("RW: exiting...")

    if (CurrentScreen === 'ChatRoom') {
      ChatRoomSetLastChatRoom(null)
      DialogLentLockpicks = false
      ChatRoomClearAllElements()
      ServerSend('ChatRoomLeave', '')
      ChatRoomSetLastChatRoom(null)
      ChatRoomLeashPlayer = null
      CommonSetScreen('Online', 'ChatSearch')
      CharacterDeleteAllOnline()
      ChatSearchExit()
    } else {
      MainHallWalk('MainHall')
    }

    appendMessage("RW: success")
  }

  return <>
    <p>退出房间</p>
    {message.length == 0 ?
      <button onClick={onClick}>run</button> :
      message.map((msg, index) => (
        <p key={index}>{msg}</p>
      ))}
  </>
}
