import {useEffect, useState} from "react";
import {type sourceLanguageCode, sourceLanguages, type targetLanguageCode} from "./languages.ts";
import LanguageSelector from "./LanguageSelector.tsx";
import type {ProviderType} from "./module.ts";
import module from "./module.ts";
import Tabs from "../../components/Tabs.tsx";
import Button from "../../components/Button";
import {Select, Textarea, TextInput} from "../../components/FieldControls";
import {FormField, FormSectionTitle} from "../../components/Form";
import ToggleRow, {ToggleRowGroup} from "../../components/ToggleRow";

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
      .catch(e => setResult(`Error: ${e.message}`))
      .finally(() => setLoading(false));
  };

  return (
    <div className="rw-field-stack">
      <FormField label="源语言" controlClassName="w-full">
        <LanguageSelector className="w-full" value={sourceLang}
                          onChange={it => setSourceLang(it as sourceLanguageCode)} type="source"/>
      </FormField>
      <div className="flex justify-center">
        <Button size="small" variant="secondary" onClick={() => {
          if (!(targetLang in sourceLanguages)) return;
          setSourceLang(targetLang as sourceLanguageCode);
          setTargetLang(sourceLang as targetLanguageCode);
        }}>⇄ 交换</Button>
      </div>
      <FormField label="目标语言" controlClassName="w-full">
        <LanguageSelector className="w-full" value={targetLang}
                          onChange={it => setTargetLang(it as targetLanguageCode)} type="target"/>
      </FormField>
      <Textarea className="w-full" value={text} onChange={e => {
        setText(e.target.value);
        module.updateTypingStatus(e.target.value);
      }} placeholder="输入要翻译的文本..." rows={3}/>
      <Button onClick={handleTranslate} disabled={loading}>
        {loading ? '... 翻译中 ...' : '▶ 翻译'}
      </Button>
      <Textarea className="w-full" value={result} onChange={e => {
        setResult(e.target.value);
        module.updateTypingStatus(e.target.value);
      }} rows={3} placeholder="翻译结果..."/>
      <div className="rw-button-row">
        <Button onClick={() => navigator.clipboard.writeText(result)}>复制</Button>
        <Button onClick={() => {
          module.clearTypingStatus();
          ServerSend('ChatRoomChat', {Content: result, Type: 'Chat'});
        }}>Chat 发送
        </Button>
        <Button onClick={() => {
          module.clearTypingStatus();
          ServerSend('ChatRoomChat', {Content: result, Type: 'Emote'});
        }}>Activity 发送
        </Button>
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
  const [bioVerticalLayout, setBioVerticalLayout] = useState(module.bioVerticalLayout);
  const [receiveSourceLanguage, setReceiveSourceLanguage] = useState<sourceLanguageCode | null>(module.receiveSourceLanguage);
  const [receiveTargetLanguage, setReceiveTargetLanguage] = useState<targetLanguageCode>(module.receiveTargetLanguage);
  const [syncInputStatus, setSyncInputStatus] = useState(module.syncInputStatus);

  useEffect(() => {
    module.sendEnable = sendEnable;
    module.saveConfig();
  }, [sendEnable]);
  useEffect(() => {
    module.sendSourceLanguage = sendSourceLanguage;
    module.saveConfig();
  }, [sendSourceLanguage]);
  useEffect(() => {
    module.sendTargetLanguage = sendTargetLanguage;
    module.saveConfig();
  }, [sendTargetLanguage]);
  useEffect(() => {
    module.receiveEnable = receiveEnable;
    module.saveConfig();
  }, [receiveEnable]);
  useEffect(() => {
    module.bioEnable = bioEnable;
    module.saveConfig();
  }, [bioEnable]);
  useEffect(() => {
    module.bioVerticalLayout = bioVerticalLayout;
    module.saveConfig();
  }, [bioVerticalLayout]);
  useEffect(() => {
    module.receiveSourceLanguage = receiveSourceLanguage;
    module.saveConfig();
  }, [receiveSourceLanguage]);
  useEffect(() => {
    module.receiveTargetLanguage = receiveTargetLanguage;
    module.saveConfig();
  }, [receiveTargetLanguage]);
  useEffect(() => {
    module.syncInputStatus = syncInputStatus;
    module.saveConfig();
  }, [syncInputStatus]);

  return (
    <div>
      <div className="rw-warning-box">
        ⚠ 翻译服务使用第三方 API，可能会保存您的消息内容，请谨慎使用。
      </div>

      <FormSectionTitle>翻译开关</FormSectionTitle>
      <ToggleRowGroup>
        <ToggleRow checked={sendEnable} onChange={setSendEnable}>发送翻译</ToggleRow>
        <ToggleRow checked={receiveEnable} onChange={setReceiveEnable}>接收翻译</ToggleRow>
        <ToggleRow checked={bioEnable} onChange={setBioEnable}>简介翻译</ToggleRow>
        <ToggleRow checked={bioVerticalLayout} onChange={setBioVerticalLayout}>简介上下分栏</ToggleRow>
        <ToggleRow checked={syncInputStatus} onChange={setSyncInputStatus}>同步输入状态</ToggleRow>
      </ToggleRowGroup>

      <FormSectionTitle>发送语言设置</FormSectionTitle>
      <FormField label="源语言" controlClassName="w-full">
        <LanguageSelector className="w-full" value={sendSourceLanguage}
                          onChange={it => setSendSourceLanguage(it as sourceLanguageCode)}
                          type="source"/>
      </FormField>
      <FormField label="目标语言" controlClassName="w-full">
        <LanguageSelector className="w-full" value={sendTargetLanguage}
                          onChange={it => setSendTargetLanguage(it as targetLanguageCode)}
                          type="target"/>
      </FormField>

      <FormSectionTitle>接收语言设置</FormSectionTitle>
      <FormField label="源语言" controlClassName="w-full">
        <LanguageSelector className="w-full" value={receiveSourceLanguage ?? ''}
                          onChange={it => setReceiveSourceLanguage(it as sourceLanguageCode)}
                          type="source"/>
      </FormField>
      <FormField label="目标语言" controlClassName="w-full">
        <LanguageSelector className="w-full" value={receiveTargetLanguage}
                          onChange={it => setReceiveTargetLanguage(it as targetLanguageCode)}
                          type="target"/>
      </FormField>
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

  useEffect(() => {
    module.providerType = providerType;
    module.saveConfig();
  }, [providerType]);
  useEffect(() => {
    module.apiUrl = apiUrl;
    module.saveConfig();
  }, [apiUrl]);
  useEffect(() => {
    module.aiApiUrl = aiApiUrl;
    module.saveConfig();
  }, [aiApiUrl]);
  useEffect(() => {
    module.aiApiKey = aiApiKey;
    module.saveConfig();
  }, [aiApiKey]);
  useEffect(() => {
    module.aiModel = aiModel;
    module.saveConfig();
  }, [aiModel]);
  useEffect(() => {
    module.aiPrompt = aiPrompt;
    module.saveConfig();
  }, [aiPrompt]);

  return (
    <div>
      <FormField label="翻译提供者" controlClassName="w-full">
        <Select className="w-full" value={providerType}
                onChange={e => setProviderType(e.target.value as ProviderType)}>
          <option value="deeplx">DeepLX</option>
          <option value="ai">AI (ChatCompletions)</option>
        </Select>
      </FormField>
      {providerType === 'deeplx' && (
        <FormField label="API URL" controlClassName="w-full">
          <TextInput className="w-full" type="text" value={apiUrl} onChange={e => setApiUrl(e.target.value)}/>
        </FormField>
      )}
      {providerType === 'ai' && (
        <>
          <FormField label="API URL" controlClassName="w-full">
            <TextInput className="w-full" type="text" value={aiApiUrl} onChange={e => setAiApiUrl(e.target.value)}
                       placeholder="https://api.openai.com/v1/chat/completions"/>
          </FormField>
          <FormField label="API Key" controlClassName="w-full">
            <TextInput className="w-full" type="password" value={aiApiKey}
                       onChange={e => setAiApiKey(e.target.value)} placeholder="sk-..."/>
          </FormField>
          <FormField label="模型名称" controlClassName="w-full">
            <TextInput className="w-full" type="text" value={aiModel} onChange={e => setAiModel(e.target.value)}
                       placeholder="gpt-4o-mini"/>
          </FormField>
          <FormField label="系统提示词" controlClassName="w-full">
            <Textarea className="w-full" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} rows={4}
                      placeholder="使用 {sourceLang} 和 {targetLang} 作为语言占位符"/>
          </FormField>
        </>
      )}
    </div>
  );
}

export default function TranslationPage() {
  return (
    <div>
      <p>翻译设置</p>
      <Tabs>
        <Tabs.Tab label="翻译测试"><TestTab/></Tabs.Tab>
        <Tabs.Tab label="翻译配置"><ConfigTab/></Tabs.Tab>
        <Tabs.Tab label="提供者配置"><ProviderTab/></Tabs.Tab>
      </Tabs>
    </div>
  );
}
