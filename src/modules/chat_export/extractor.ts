import render from "./render.ts";

type MessageEntry = MessageEntryChat | MessageEntryPrivate | MessageEntryAction;

interface MessageEntryBase {
  sender: number;
  time: string
}

interface MessageEntryChat extends MessageEntryBase{
  type: 'chat';
  senderNickname: string;
  content: string;
  replyTo?: string;
  msgId?: string;
}

interface MessageEntryPrivate extends MessageEntryBase{
  type: 'private';
  senderNickname: string;
  content: string;
  replyTo?: string;
  msgId?: string;
}

interface MessageEntryAction extends MessageEntryBase{
  type: 'action';
  content: string;
}

function extractClasses(element: Element): Set<string> {
  return new Set(element.className
    .split(' ')
    .filter(c => c.trim().length > 0));
}

export function extract(includePrivate: boolean = false) {
  const mainDiv = document.getElementById('TextAreaChatLog');
  const messages: MessageEntry[] = [];

  for (const childDiv of mainDiv.children) {
    const classes = extractClasses(childDiv)
    const sender = parseInt(childDiv.getAttribute('data-sender'));
    const time = childDiv.getAttribute('data-time');
    if (classes.has('ChatMessageChat')) {
      const message: MessageEntryChat = {
        type: 'chat',
        senderNickname: '',
        content: '',
        sender: sender,
        time: time
      }
      for (const childDivEntry of childDiv.children) {
        const childDivEntryClasses = extractClasses(childDivEntry)
        if (childDivEntryClasses.has('chat-room-sep') || childDivEntryClasses.has('chat-room-sep-last')) {
          continue;
        }
        if (childDivEntryClasses.has('chat-room-message-content')) {
          // @ts-expect-error innerText
          message.content = childDivEntry.innerText || childDivEntry.innerHTML;
          message.msgId = childDivEntry.getAttribute('msgid');
        } else if (childDivEntryClasses.has('ChatMessageName')) {
          // @ts-expect-error innerText
          message.senderNickname = childDivEntry.innerText || childDivEntry.innerHTML;
        } else if (childDivEntryClasses.has('chat-room-message-reply')) {
          // @ts-expect-error innerText
          message.replyTo = childDivEntry.innerText || childDivEntry.innerHTML;
        }
      }
      messages.push(message);
    } else if (classes.has('ChatMessageWhisper') && includePrivate) {
      const message: MessageEntryPrivate = {
        type: 'private',
        senderNickname: '',
        content: '',
        sender: sender,
        time: time
      }
      for (const childDivEntry of childDiv.children) {
        const childDivEntryClasses = extractClasses(childDivEntry)
        if (childDivEntryClasses.has('chat-room-sep') || childDivEntryClasses.has('chat-room-sep-last')) {
          continue;
        }
        if (childDivEntryClasses.has('chat-room-message-content')) {
          // @ts-expect-error innerText
          message.content = childDivEntry.innerText || childDivEntry.innerHTML;
          message.msgId = childDivEntry.getAttribute('msgid');
        } else if (childDivEntryClasses.has('ChatMessageName')) {
          // @ts-expect-error innerText
          message.senderNickname = childDivEntry.innerText || childDivEntry.innerHTML;
        } else if (childDivEntryClasses.has('chat-room-message-reply')) {
          // @ts-expect-error innerText
          message.replyTo = childDivEntry.innerText || childDivEntry.innerHTML;
        }
      }
      messages.push(message);
    } else if (classes.has('ChatMessageAction') || classes.has('ChatMessageActivity')) {
      let content = ''
      for (const childDivEntry of childDiv.childNodes) {
        if (childDivEntry.nodeType === Node.TEXT_NODE) {
          content += childDivEntry.textContent;
        }
      }
      messages.push({ type: 'action', sender: sender, time: time, content: content });
    }
  }

  const resultContent = render(messages);
  const blob = new Blob([resultContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `chatlog_${new Date().toISOString().replace(/[:.]/g, "-")}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
