import {useEffect, useState} from "react";
import {sourceLanguages, type sourceLanguageCode, type targetLanguageCode} from "./languages.ts";
import LanguageSelector from "./LanguageSelector.tsx";
import module from "./module.ts";
import type {ProviderType} from "./module.ts";
import Tabs from "../../components/Tabs.tsx";
import './page.css';

function TestTab() {
  const [text, setText] = useState('');
  const [sourceLang, setSourceLang] = useState<sourceLanguageCode>('ZH');
  const [targetLang, setTargetLang] = useState<targetLanguageCode>('EN');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTranslate = () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setResult('');
    module.translate(sourceLang, targetLang, text)
      .then(r => setResult(r.text))
      .catch(e => setResult(`翻译失败: ${e.message}`))
      .finally(() => setLoading(false));
  };

  return (
    <div>
      <LanguageSelector value={sourceLang} onChange={it => setSourceLang(it as sourceLanguageCode)} label="源语言" type="source"/>
      <button onClick={() => {
        if (!(targetLang in sourceLanguages)) return;
        setSourceLang(targetLang as sourceLanguageCode);
        setTargetLang(sourceLang as targetLanguageCode);
      }}>⇄ 交换语言</button>
      <LanguageSelector value={targetLang} onChange={it => setTargetLang(it as targetLanguageCode)} label="目标语言" type="target"/>
      <br/>
      <textarea className="rw-full-width" value={text} onChange={e => {
        setText(e.target.value);
        module.updateTypingStatus(e.target.value);
      }} placeholder="输入要翻译的文本..." rows={3}/>
      <button onClick={handleTranslate} disabled={loading}>
        {loading ? '翻译中...' : '翻译'}
      </button>
      <br/>
      <textarea className="rw-full-width" value={result} onChange={e => {
        setResult(e.target.value);
        module.updateTypingStatus(e.target.value);
      }} rows={3}/>
      <div className="rw-btn-row">
        <button onClick={() => navigator.clipboard.writeText(result)}>复制</button>
        <button onClick={() => { module.clearTypingStatus(); ServerSend('ChatRoomChat', {Content: result, Type: 'Chat'}); }}>作为Chat发送</button>
        <button onClick={() => { module.clearTypingStatus(); ServerSend('ChatRoomChat', {Content: result, Type: 'Emote'}); }}>作为Activity发送</button>
      </div>
    </div>
  );
}

function ConfigTab() {
  const [sendEnable, setSendEnable] = useState(module.sendEnable);
  const [sendSourceLanguage, setSendSourceLanguage] = useState<sourceLanguageCode>(module.sendSourceLanguage);
  const [sendTargetLanguage, setSendTargetLanguage] = useState<targetLanguageCode>(module.sendTargetLanguage);
  const [receiveEnable, setReceiveEnable] = useState(module.receiveEnable);
  const [bioEnable, setBioEnable] = useState(module.bioEnable);
  const [receiveSourceLanguage, setReceiveSourceLanguage] = useState<sourceLanguageCode | null>(module.receiveSourceLanguage);
  const [receiveTargetLanguage, setReceiveTargetLanguage] = useState<targetLanguageCode>(module.receiveTargetLanguage);
  const [syncInputStatus, setSyncInputStatus] = useState(module.syncInputStatus);

  useEffect(() => { module.sendEnable = sendEnable; module.saveConfig(); }, [sendEnable]);
  useEffect(() => { module.sendSourceLanguage = sendSourceLanguage; module.saveConfig(); }, [sendSourceLanguage]);
  useEffect(() => { module.sendTargetLanguage = sendTargetLanguage; module.saveConfig(); }, [sendTargetLanguage]);
  useEffect(() => { module.receiveEnable = receiveEnable; module.saveConfig(); }, [receiveEnable]);
  useEffect(() => { module.bioEnable = bioEnable; module.saveConfig(); }, [bioEnable]);
  useEffect(() => { module.receiveSourceLanguage = receiveSourceLanguage; module.saveConfig(); }, [receiveSourceLanguage]);
  useEffect(() => { module.receiveTargetLanguage = receiveTargetLanguage; module.saveConfig(); }, [receiveTargetLanguage]);
  useEffect(() => { module.syncInputStatus = syncInputStatus; module.saveConfig(); }, [syncInputStatus]);

  return (
    <div>
      <p>警告：翻译服务使用第三方API，可能会保存您的消息内容，请谨慎使用。</p>
      <label>
        <input type="checkbox" checked={sendEnable} onChange={e => setSendEnable(e.target.checked)}/>
        发送翻译
      </label>
      <label>
        <input type="checkbox" checked={receiveEnable} onChange={e => setReceiveEnable(e.target.checked)}/>
        接收翻译
      </label>
      <label>
        <input type="checkbox" checked={bioEnable} onChange={e => setBioEnable(e.target.checked)}/>
        简介翻译
      </label>
      <label>
        <input type="checkbox" checked={syncInputStatus} onChange={e => setSyncInputStatus(e.target.checked)}/>
        同步输入状态
      </label>
      <LanguageSelector value={sendSourceLanguage} onChange={it => setSendSourceLanguage(it as sourceLanguageCode)}
                        label="send source language"/>
      <LanguageSelector value={sendTargetLanguage} onChange={it => setSendTargetLanguage(it as targetLanguageCode)}
                        label="send target language" type="target"/>
      <LanguageSelector value={receiveSourceLanguage ?? ''}
                        onChange={it => setReceiveSourceLanguage(it as sourceLanguageCode)}
                        label="receive source language" type="source"/>
      <LanguageSelector value={receiveTargetLanguage}
                        onChange={it => setReceiveTargetLanguage(it as targetLanguageCode)}
                        label="receive target language" type="target"/>
    </div>
  );
}

function ProviderTab() {
  const [providerType, setProviderType] = useState<ProviderType>(module.providerType);
  const [apiUrl, setApiUrl] = useState(module.apiUrl);
  const [aiApiUrl, setAiApiUrl] = useState(module.aiApiUrl);
  const [aiApiKey, setAiApiKey] = useState(module.aiApiKey);
  const [aiModel, setAiModel] = useState(module.aiModel);
  const [aiPrompt, setAiPrompt] = useState(module.aiPrompt);

  useEffect(() => { module.providerType = providerType; module.saveConfig(); }, [providerType]);
  useEffect(() => { module.apiUrl = apiUrl; module.saveConfig(); }, [apiUrl]);
  useEffect(() => { module.aiApiUrl = aiApiUrl; module.saveConfig(); }, [aiApiUrl]);
  useEffect(() => { module.aiApiKey = aiApiKey; module.saveConfig(); }, [aiApiKey]);
  useEffect(() => { module.aiModel = aiModel; module.saveConfig(); }, [aiModel]);
  useEffect(() => { module.aiPrompt = aiPrompt; module.saveConfig(); }, [aiPrompt]);

  return (
    <div>
      <label>
        翻译提供者
        <select className="rw-full-width" value={providerType} onChange={e => setProviderType(e.target.value as ProviderType)}>
          <option value="deeplx">DeepLX</option>
          <option value="ai">AI (ChatCompletions)</option>
        </select>
      </label>
      {providerType === 'deeplx' && (
        <label>
          API URL
          <input className="rw-full-width" type="text" value={apiUrl} onChange={e => setApiUrl(e.target.value)}/>
        </label>
      )}
      {providerType === 'ai' && (
        <>
          <label>
            API URL
            <input className="rw-full-width" type="text" value={aiApiUrl} onChange={e => setAiApiUrl(e.target.value)} placeholder="https://api.openai.com/v1/chat/completions"/>
          </label>
          <br/>
          <label>
            API Key
            <input className="rw-full-width" type="password" value={aiApiKey} onChange={e => setAiApiKey(e.target.value)} placeholder="sk-..."/>
          </label>
          <br/>
          <label>
            模型名称
            <input className="rw-full-width" type="text" value={aiModel} onChange={e => setAiModel(e.target.value)} placeholder="gpt-4o-mini"/>
          </label>
          <br/>
          <label>
            系统提示词
            <textarea className="rw-full-width" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} rows={4} placeholder="使用 {sourceLang} 和 {targetLang} 作为语言占位符"/>
          </label>
        </>
      )}
    </div>
  );
}

export default function TranslationPage() {
  return (
    <div>
      <p>翻译</p>
      <Tabs>
        <Tabs.Tab label="翻译测试"><TestTab/></Tabs.Tab>
        <Tabs.Tab label="翻译配置"><ConfigTab/></Tabs.Tab>
        <Tabs.Tab label="提供者配置"><ProviderTab/></Tabs.Tab>
      </Tabs>
    </div>
  );
}