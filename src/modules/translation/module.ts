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

    razorModSdk.hookFunction("ChatRoomMessageDisplay", 10, ([data, ...msg], next) => {
      if (this.receiveEnable && ['Chat', 'Whisper', 'Emote'].indexOf(data.Type) !== -1 && data.Sender !== Player.MemberNumber) {
        const element = next([data, ...msg]);

        const translationElement = document.createElement('span');
        translationElement.innerText = '翻译中...';
        translationElement.className = 'razorwings-translation-text razorwings-translation-pending';
        element.insertAdjacentElement('beforeend', document.createElement('br'));
        element.insertAdjacentElement('beforeend', translationElement);

        // Scroll to end after appending translation placeholder, since the original
        // ChatRoomAppendChat already ran its scroll logic before we added these elements
        if (ElementIsScrolledToEnd("TextAreaChatLog")) {
          ElementScrollToEnd("TextAreaChatLog");
        }

        (async () => {
          const translated = await new DeeplxTranslationProvider(this.apiUrl)
            .translate(this.receiveSourceLanguage, this.receiveTargetLanguage, data.Content);
          // Capture scroll state before changing content height
          const wasAtEnd = ElementIsScrolledToEnd("TextAreaChatLog");
          translationElement.className = 'razorwings-translation-text razorwings-translation-success';
          translationElement.innerText = translated.text;
          if (wasAtEnd) ElementScrollToEnd("TextAreaChatLog");
        })().catch(error => {
          const wasAtEnd = ElementIsScrolledToEnd("TextAreaChatLog");
          translationElement.className = 'razorwings-translation-text razorwings-translation-error';
          translationElement.innerText = `翻译失败: ${error.message}`;
          if (wasAtEnd) ElementScrollToEnd("TextAreaChatLog");
        });

        return element;
      }

      return next([data, ...msg]);
    });

    razorModSdk.hookFunction('ServerSend', 10, ([messageType, ...args], next) => {
      if (this.sendEnable && messageType == "ChatRoomChat") {
        const message = args[0] as ServerChatRoomMessage;
        if (['Chat', 'Whisper', 'Emote'].indexOf(message.Type) !== -1) {

          (async () => {
            const translated = await new DeeplxTranslationProvider(this.apiUrl)
              .translate(this.sendSourceLanguage, this.sendTargetLanguage, message.Content);
            message.Content += '\n[i] ' + translated.text;
            next([messageType, ...args]);
          })().catch(error => {
            ChatRoomSendLocal(`翻译失败: ${error.message}`);
            next([messageType, ...args]);
          });

          return;
        }
      }
      return next([messageType, ...args]);
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
