export function selectTarget(expr: string): Character | null {
  expr = expr.trim();
  if (expr.length === 0) {
    return null;
  }
  let target: Character[];
  // if expr all numbers
  if (/^\d+$/.test(expr)) {
    target = ChatRoomCharacter.filter(it => it.CharacterID === expr);
  }
  // if expr is a name
  if (!target || target.length === 0) {
    target = ChatRoomCharacter.filter(it => it.Name === expr);
  }
  // if expr is a nickname
  if (!target || target.length === 0) {
    target = ChatRoomCharacter.filter(it => it.Nickname === expr);
  }
  // if expr is a part of Name
  if (!target || target.length === 0) {
    target = ChatRoomCharacter.filter(it => it.Name.includes(expr));
  }
  // if expr is a part of Nickname
  if (!target || target.length === 0) {
    target = ChatRoomCharacter.filter(it => it.Nickname.includes(expr));
  }
  // if expr is @s
  if (!target || target.length === 0 && expr == '@s') {
    target = [Player];
  }
  // if expr is @r
  if (!target || target.length === 0 && expr == '@r') {
    target = [ChatRoomCharacter[Math.floor(Math.random() * ChatRoomCharacter.length)]];
  }
  if (target && target.length === 1) {
    return target[0];
  } else {
    return null;
  }
}
