import './style.css?page'
import {DeeplxTranslationProvider} from "./provider/deeplx.ts";
import {AiTranslationProvider} from "./provider/ai.ts";
import type {sourceLanguageCode, targetLanguageCode} from "./languages.ts";
import razorModSdk from "../../razor-wings";
import type AbstractModule from "../AbstractModule.ts";

const defaultApiUrl = 'https://aurora-wings.bgp.ink/translate';
const defaultAiPrompt = 'You are a translator for Bondage Club, an online BDSM role-playing game. Messages may contain roleplay actions, BDSM terminology, and domain-specific abbreviations. Preserve the original tone and style. Translate from {sourceLang} to {targetLang}. Output only the translated text, nothing else.';

export type ProviderType = 'deeplx' | 'ai';

class TranslationModule implements AbstractModule {
  providerType: ProviderType = 'deeplx';
  apiUrl: string = defaultApiUrl;
  aiApiUrl: string = '';
  aiApiKey: string = '';
  aiModel: string = '';
  aiPrompt: string = defaultAiPrompt;
  sendSourceLanguage: sourceLanguageCode = 'ZH';
  sendTargetLanguage: targetLanguageCode = 'EN';

  receiveSourceLanguage: sourceLanguageCode | null = null;
  receiveTargetLanguage: targetLanguageCode = 'ZH';

  sendEnable: boolean = false;
  receiveEnable: boolean = false;
  syncInputStatus: boolean = false;

  private statusTimer: ReturnType<typeof setTimeout> | null = null;

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

    this.initReceiveTranslation();
    this.initSendTranslation();
  }

  updateTypingStatus(text: string) {
    if (!this.syncInputStatus) return;
    // Dispatch synthetic input event on BC's #InputChat so BCX's
    // input listener (SetInputElement) picks it up. BC uses keyup,
    // so this only triggers BCX's handler.
    this.dispatchInputChatEvent(text);
    // BC native fallback for non-BCX viewers
    if (text.length >= 3) {
      this.sendBCStatus('Talk');
      if (this.statusTimer) clearTimeout(this.statusTimer);
      this.statusTimer = setTimeout(() => this.sendBCStatus(null), 5000);
    } else {
      this.sendBCStatus(null);
    }
  }

  clearTypingStatus() {
    if (!this.syncInputStatus) return;
    this.dispatchInputChatEvent('');
    if (this.statusTimer) {
      clearTimeout(this.statusTimer);
      this.statusTimer = null;
    }
    this.sendBCStatus(null);
  }

  private dispatchInputChatEvent(text: string) {
    const inputChat = document.getElementById('InputChat') as HTMLTextAreaElement | null;
    if (!inputChat) return;
    const orig = inputChat.value;
    inputChat.value = text;
    inputChat.dispatchEvent(new Event('input'));
    inputChat.value = orig;
  }

  private sendBCStatus(status: string | null) {
    if (status === (Player.Status ?? null)) return;
    Player.Status = status;
    Player.StatusTimer = status === 'Talk' ? CommonTime() + 5000 : null;
    ServerSend('ChatRoomChat', {Content: status ?? 'null', Type: 'Status'} as never);
  }

  translate(source: sourceLanguageCode | null, target: targetLanguageCode, text: string) {
    if (this.providerType === 'ai') {
      return new AiTranslationProvider(this.aiApiUrl, this.aiApiKey, this.aiModel, this.aiPrompt).translate(source ?? 'auto', target, text);
    }
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
      this.providerType = config.providerType || this.providerType;
      this.apiUrl = config.apiUrl || this.apiUrl;
      this.aiApiUrl = config.aiApiUrl || this.aiApiUrl;
      this.aiApiKey = config.aiApiKey || this.aiApiKey;
      this.aiModel = config.aiModel || this.aiModel;
      this.aiPrompt = config.aiPrompt || this.aiPrompt;
      this.sendSourceLanguage = config.sendSourceLanguage || this.sendSourceLanguage;
      this.sendTargetLanguage = config.sendTargetLanguage || this.sendTargetLanguage;
      this.receiveSourceLanguage = config.receiveSourceLanguage || this.receiveSourceLanguage;
      this.receiveTargetLanguage = config.receiveTargetLanguage || this.receiveTargetLanguage;
      this.sendEnable = config.sendEnable ?? this.sendEnable;
      this.receiveEnable = config.receiveEnable ?? this.receiveEnable;
      this.syncInputStatus = config.syncInputStatus ?? this.syncInputStatus;
    } else {
      this.saveConfig();
    }
  }

  saveConfig() {
    localStorage['razorwings.translation'] = JSON.stringify({
      providerType: this.providerType,
      apiUrl: this.apiUrl,
      aiApiUrl: this.aiApiUrl,
      aiApiKey: this.aiApiKey,
      aiModel: this.aiModel,
      aiPrompt: this.aiPrompt,
      sendSourceLanguage: this.sendSourceLanguage,
      sendTargetLanguage: this.sendTargetLanguage,
      receiveSourceLanguage: this.receiveSourceLanguage,
      receiveTargetLanguage: this.receiveTargetLanguage,
      sendEnable: this.sendEnable,
      receiveEnable: this.receiveEnable,
      syncInputStatus: this.syncInputStatus,
    });
  }
}

export default new TranslationModule();
