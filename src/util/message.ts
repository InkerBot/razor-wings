export async function sendActivityText(activityText: string, dictionary?: ChatMessageDictionary) {
  const activityTextBuffer = new TextEncoder().encode(activityText);
  const digestBuffer = await crypto.subtle.digest('SHA-256', activityTextBuffer);
  const digest = Array.from(new Uint8Array(digestBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  const activityName = 'RWACTIVITY_' + digest;

  const dictionaryData = dictionary ? [...dictionary] : [];
  dictionaryData.push({
    Tag: 'MISSING ACTIVITY DESCRIPTION FOR KEYWORD ' + activityName,
    Text: activityText,
  });
  ServerSend("ChatRoomChat", {
    Type: 'Activity',
    Content: activityName,
    Dictionary: dictionaryData,
  });
}
