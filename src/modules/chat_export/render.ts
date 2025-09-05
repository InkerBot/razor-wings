export default function render(data: unknown) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>聊天记录导出</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.4;
      color: #333;
      background-color: #f5f5f5;
      padding: 10px;
      margin: 0;
    }

    .chat-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      padding: 15px;
    }

    .message {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      padding: 6px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .message:last-child {
      border-bottom: none;
    }

    .message-content {
      flex: 1;
      overflow-wrap: break-word;
    }

    .message-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      margin-left: 12px;
      min-width: 80px;
      color: #999;
      font-size: 12px;
    }

    .sender-id {
      margin-top: 2px;
    }

    .action-message {
      font-style: italic;
      color: #666;
    }

    .reply {
      color: #888;
      font-size: 12px;
      margin-top: 4px;
      padding-left: 10px;
      border-left: 2px solid #ddd;
    }
  </style>
</head>
<body>
<div class="chat-container" id="chatContainer">
  
</div>

<script>
  function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  function getColorBySenderId(senderId) {
    const seed = parseInt(senderId);
    const h = Math.floor(seededRandom(seed) * 360);
    const s = 60 + Math.floor(seededRandom(seed + 1) * 25);
    const l = 40 + Math.floor(seededRandom(seed + 2) * 20);

    return \`hsl(\${h}, \${s}%, \${l}%)\`;
  }

  function renderMessages(data) {
    const container = document.getElementById('chatContainer');

    data.forEach(item => {
      if (item.type === 'action' && !item.content) return; // 跳过空内容动作

      const messageEl = document.createElement('div');
      messageEl.className = 'message';

      const contentEl = document.createElement('div');
      contentEl.className = 'message-content';

      const metaEl = document.createElement('div');
      metaEl.className = 'message-meta';

      const timeEl = document.createElement('div');
      timeEl.className = 'message-time';
      timeEl.textContent = item.time;

      const senderIdEl = document.createElement('div');
      senderIdEl.className = 'sender-id';
      senderIdEl.textContent = item.sender;

      metaEl.appendChild(timeEl);
      metaEl.appendChild(senderIdEl);

      if (item.type === 'chat') {
        if (item.replyTo) {
          const replyEl = document.createElement('div');
          replyEl.className = 'reply';
          replyEl.textContent = item.replyTo;
          contentEl.appendChild(replyEl);
        }

        const senderNameEl = document.createElement('span');
        senderNameEl.style.color = getColorBySenderId(item.sender);
        senderNameEl.textContent = item.senderNickname + ': ';

        contentEl.appendChild(senderNameEl);
        contentEl.appendChild(document.createTextNode(item.content));
      } else if (item.type === 'private') {
        if (item.replyTo) {
          const replyEl = document.createElement('div');
          replyEl.className = 'reply';
          replyEl.textContent = item.replyTo;
          contentEl.appendChild(replyEl);
        }

        const senderNameEl = document.createElement('span');
        senderNameEl.style.color = getColorBySenderId(item.sender);
        senderNameEl.textContent = '悄悄话 ' + item.senderNickname + ': ';

        contentEl.appendChild(senderNameEl);
        contentEl.appendChild(document.createTextNode(item.content));
      } else if (item.type === 'action') {
        contentEl.className += ' action-message';
        contentEl.textContent = item.content;
      }

      messageEl.appendChild(contentEl);
      messageEl.appendChild(metaEl);
      container.appendChild(messageEl);
    });
  }

  renderMessages(${JSON.stringify(data)});
</script>
</body>
</html>
`
}
