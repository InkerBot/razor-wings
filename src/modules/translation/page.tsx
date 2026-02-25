import {useEffect, useState} from "react";
import {type sourceLanguageCode, type targetLanguageCode} from "./languages.ts";
import LanguageSelector from "./LanguageSelector.tsx";
import module from "./module.ts";
import type {ProviderType} from "./module.ts";
import './tabs.css';

type Tab = 'test' | 'config' | 'provider';

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
      <LanguageSelector value={targetLang} onChange={it => setTargetLang(it as targetLanguageCode)} label="目标语言" type="target"/>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="输入要翻译的文本..."
        rows={3}
        style={{width: '100%', marginTop: 8, boxSizing: 'border-box'}}
      />
      <button onClick={handleTranslate} disabled={loading} style={{marginTop: 4}}>
        {loading ? '翻译中...' : '翻译'}
      </button>
      {result && (
        <div style={{marginTop: 8}}>
          <textarea
            value={result}
            onChange={e => setResult(e.target.value)}
            rows={3}
            style={{width: '100%', boxSizing: 'border-box'}}
          />
          <div style={{marginTop: 4, display: 'flex', gap: 4}}>
            <button onClick={() => navigator.clipboard.writeText(result)}>复制</button>
            <button onClick={() => { ServerSend('ChatRoomChat', {Content: result, Type: 'Chat'}); }}>作为Chat发送</button>
            <button onClick={() => { ServerSend('ChatRoomChat', {Content: result, Type: 'Emote'}); }}>作为Activity发送</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ConfigTab() {
  const [sendEnable, setSendEnable] = useState(module.sendEnable);
  const [sendSourceLanguage, setSendSourceLanguage] = useState<sourceLanguageCode>(module.sendSourceLanguage);
  const [sendTargetLanguage, setSendTargetLanguage] = useState<targetLanguageCode>(module.sendTargetLanguage);
  const [receiveEnable, setReceiveEnable] = useState(module.receiveEnable);
  const [receiveSourceLanguage, setReceiveSourceLanguage] = useState<sourceLanguageCode | null>(module.receiveSourceLanguage);
  const [receiveTargetLanguage, setReceiveTargetLanguage] = useState<targetLanguageCode>(module.receiveTargetLanguage);

  useEffect(() => { module.sendEnable = sendEnable; module.saveConfig(); }, [sendEnable]);
  useEffect(() => { module.sendSourceLanguage = sendSourceLanguage; module.saveConfig(); }, [sendSourceLanguage]);
  useEffect(() => { module.sendTargetLanguage = sendTargetLanguage; module.saveConfig(); }, [sendTargetLanguage]);
  useEffect(() => { module.receiveEnable = receiveEnable; module.saveConfig(); }, [receiveEnable]);
  useEffect(() => { module.receiveSourceLanguage = receiveSourceLanguage; module.saveConfig(); }, [receiveSourceLanguage]);
  useEffect(() => { module.receiveTargetLanguage = receiveTargetLanguage; module.saveConfig(); }, [receiveTargetLanguage]);

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

  const inputStyle = {width: '100%', marginTop: 4, boxSizing: 'border-box' as const};

  return (
    <div>
      <label>
        翻译提供者
        <select value={providerType} onChange={e => setProviderType(e.target.value as ProviderType)} style={{...inputStyle, marginBottom: 8}}>
          <option value="deeplx">DeepLX</option>
          <option value="ai">AI (ChatCompletions)</option>
        </select>
      </label>

      {providerType === 'deeplx' && (
        <label>
          API URL
          <input type="text" value={apiUrl} onChange={e => setApiUrl(e.target.value)} style={inputStyle}/>
        </label>
      )}

      {providerType === 'ai' && (
        <>
          <label>
            API URL
            <input type="text" value={aiApiUrl} onChange={e => setAiApiUrl(e.target.value)} style={inputStyle} placeholder="https://api.openai.com/v1/chat/completions"/>
          </label>
          <label style={{marginTop: 8, display: 'block'}}>
            API Key
            <input type="password" value={aiApiKey} onChange={e => setAiApiKey(e.target.value)} style={inputStyle} placeholder="sk-..."/>
          </label>
          <label style={{marginTop: 8, display: 'block'}}>
            模型名称
            <input type="text" value={aiModel} onChange={e => setAiModel(e.target.value)} style={inputStyle} placeholder="gpt-4o-mini"/>
          </label>
          <label style={{marginTop: 8, display: 'block'}}>
            系统提示词
            <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} rows={4} style={inputStyle} placeholder="使用 {sourceLang} 和 {targetLang} 作为语言占位符"/>
          </label>
        </>
      )}
    </div>
  );
}

const tabs: {key: Tab; label: string}[] = [
  {key: 'test', label: '翻译测试'},
  {key: 'config', label: '翻译配置'},
  {key: 'provider', label: '提供者配置'},
];

export default function TranslationPage() {
  const [activeTab, setActiveTab] = useState<Tab>('test');

  return (
    <div>
      <p>翻译</p>
      <div className="rw-tabs">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`rw-tab ${activeTab === t.key ? 'rw-tab-active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="rw-tab-content">
        {activeTab === 'test' && <TestTab/>}
        {activeTab === 'config' && <ConfigTab/>}
        {activeTab === 'provider' && <ProviderTab/>}
      </div>
    </div>
  );
}
