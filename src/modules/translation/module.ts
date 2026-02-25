import style_css from './style.css?raw'
import {DeeplxTranslationProvider} from "./provider/deeplx.ts";
import type {sourceLanguageCode, targetLanguageCode} from "./languages.ts";
import razorModSdk from "../../razor-wings";
import type AbstractModule from "../AbstractModule.ts";

const defaultApiUrl = 'https://aurora-wings.bgp.ink/translate';

class TranslationModule implements AbstractModule {
  apiUrl: string = defaultApiUrl;
  sendSourceLanguage: sourceLanguageCode = 'ZH';
  sendTargetLanguage: targetLanguageCode = 'EN';

  receiveSourceLanguage: sourceLanguageCode | null = null;
  receiveTargetLanguage: targetLanguageCode = 'ZH';

  sendEnable: boolean = false;
  receiveEnable: boolean = false;

  switchSend(enable: boolean) {
    this.sendEnable = enable;
  }

  switchReceive(enable: boolean) {
    this.receiveEnable = enable;
  }

  initialized: boolean = false;

  init() {
    if (this.initialized) {
      return;
    }
    this.initialized = true;

    const injectStyleElement = document.createElement('style')
    injectStyleElement.innerHTML = style_css;
    document.head.appendChild(injectStyleElement);

    this.initReceiveTranslation();
    this.initSendTranslation();
  }

  private translate(source: sourceLanguageCode | null, target: targetLanguageCode, text: string) {
    return new DeeplxTranslationProvider(this.apiUrl).translate(source, target, text);
  }

  private initReceiveTranslation() {
    razorModSdk.hookFunction("ChatRoomMessageDisplay", 10, ([data, ...msg], next) => {
      if (!this.receiveEnable || ['Chat', 'Whisper', 'Emote'].indexOf(data.Type) === -1 || data.Sender === Player.MemberNumber) {
        return next([data, ...msg]);
      }

      // Capture scroll state BEFORE next() runs, since ChatRoomAppendChat
      // inside next() will append and scroll, making a post-check unreliable
      const wasAtEnd = ElementIsScrolledToEnd("TextAreaChatLog");
      const element = next([data, ...msg]);

      const translationElement = document.createElement('span');
      translationElement.innerText = '翻译中...';
      translationElement.className = 'razorwings-translation-text razorwings-translation-pending';
      element.insertAdjacentElement('beforeend', document.createElement('br'));
      element.insertAdjacentElement('beforeend', translationElement);

      if (wasAtEnd) {
        ElementScrollToEnd("TextAreaChatLog");
      }

      this.translate(this.receiveSourceLanguage, this.receiveTargetLanguage, data.Content)
        .then(translated => {
          const wasAtEnd = ElementIsScrolledToEnd("TextAreaChatLog");
          translationElement.className = 'razorwings-translation-text razorwings-translation-success';
          translationElement.innerText = translated.text;
          if (wasAtEnd) ElementScrollToEnd("TextAreaChatLog");
        })
        .catch(error => {
          const wasAtEnd = ElementIsScrolledToEnd("TextAreaChatLog");
          translationElement.className = 'razorwings-translation-text razorwings-translation-error';
          translationElement.innerText = `翻译失败: ${error.message}`;
          if (wasAtEnd) ElementScrollToEnd("TextAreaChatLog");
        });

      return element;
    });
  }

  private initSendTranslation() {
    // Flag to suppress BC's local whisper display while translation is pending.
    // Set synchronously in ServerSend hook, consumed in ChatRoomMessage hook.
    let suppressNextWhisperDisplay = false;

    razorModSdk.hookFunction('ChatRoomMessage', 10, ([data, ...rest], next) => {
      if (suppressNextWhisperDisplay && data.Type === 'Whisper') {
        suppressNextWhisperDisplay = false;
        return;
      }
      return next([data, ...rest]);
    });

    razorModSdk.hookFunction('ServerSend', 10, ([messageType, ...args], next) => {
      if (!this.sendEnable || messageType !== "ChatRoomChat") {
        return next([messageType, ...args]);
      }

      const message = args[0] as ServerChatRoomMessage;
      if (['Chat', 'Whisper', 'Emote'].indexOf(message.Type) === -1) {
        return next([messageType, ...args]);
      }

      const isNonSelfWhisper = message.Type === 'Whisper' && message.Target !== Player.MemberNumber;

      // For non-self whispers, suppress BC's immediate local display
      // (ChatRoomSendWhisper calls ChatRoomMessage right after ServerSend)
      if (isNonSelfWhisper) {
        suppressNextWhisperDisplay = true;
      }

      // Show pending message with translating indicator
      const pendingId = `rw-pending-${Date.now()}`;
      const escapedContent = message.Content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
      ChatRoomSendLocal(
        `<span id="${pendingId}" class="razorwings-send-pending">` +
        `<span class="razorwings-translation-text razorwings-translation-pending">正在翻译...</span><br>` +
        `${escapedContent}` +
        `</span>`
      );

      const removePending = () => {
        document.getElementById(pendingId)?.closest('.ChatMessage')?.remove();
      };

      this.translate(this.sendSourceLanguage, this.sendTargetLanguage, message.Content)
        .then(translated => {
          removePending();
          message.Content += '\n[i] ' + translated.text;
          next([messageType, ...args]);
          if (isNonSelfWhisper) {
            ChatRoomMessage(message);
          }
        })
        .catch(error => {
          removePending();
          ChatRoomSendLocal(`翻译失败: ${error.message}`);
          next([messageType, ...args]);
          if (isNonSelfWhisper) {
            ChatRoomMessage(message);
          }
        });
    });
  }

  loadConfig() {
    const localStorageElement = localStorage['razorwings.translation'];
    if (localStorageElement) {
      const config = JSON.parse(localStorageElement);
      this.apiUrl = config.apiUrl || this.apiUrl;
      this.sendSourceLanguage = config.sendSourceLanguage || this.sendSourceLanguage;
      this.sendTargetLanguage = config.sendTargetLanguage || this.sendTargetLanguage;
      this.receiveSourceLanguage = config.receiveSourceLanguage || this.receiveSourceLanguage;
      this.receiveTargetLanguage = config.receiveTargetLanguage || this.receiveTargetLanguage;
      this.sendEnable = config.sendEnable ?? this.sendEnable;
      this.receiveEnable = config.receiveEnable ?? this.receiveEnable;
    } else {
      this.saveConfig();
    }
  }

  saveConfig() {
    localStorage['razorwings.translation'] = JSON.stringify({
      apiUrl: this.apiUrl,
      sendSourceLanguage: this.sendSourceLanguage,
      sendTargetLanguage: this.sendTargetLanguage,
      receiveSourceLanguage: this.receiveSourceLanguage,
      receiveTargetLanguage: this.receiveTargetLanguage,
      sendEnable: this.sendEnable,
      receiveEnable: this.receiveEnable,
    });
  }
}

export default new TranslationModule();
