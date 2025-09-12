export async function sendActivityText(activityText: string, dictionary?: ChatMessageDictionary) {
  const activityName = 'RWACTIVITY_UNKNOWN';

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
