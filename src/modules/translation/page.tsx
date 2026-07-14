import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {type sourceLanguageCode, sourceLanguages, type targetLanguageCode} from "@/modules/translation/languages.ts";
import LanguageSelector from "@/modules/translation/LanguageSelector.tsx";
import type {ProviderType} from "@/modules/translation/module.ts";
import module from "@/modules/translation/module.ts";
import Tabs from "@/components/Tabs.tsx";
import Button from "@/components/Button";
import {Select, Textarea, TextInput} from "@/components/FieldControls";
import {FormField, FormSectionTitle} from "@/components/Form";
import ToggleRow, {ToggleRowGroup} from "@/components/ToggleRow";

function TestTab() {
  const {t} = useTranslation();
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
      .catch(e => setResult(`${t('common.error')}: ${e.message}`))
      .finally(() => setLoading(false));
  };

  return (
    <div className="rw-field-stack">
      <FormField label={t('translation.sourceLanguage')} controlClassName="w-full">
        <LanguageSelector className="w-full" value={sourceLang}
                          onChange={it => setSourceLang(it as sourceLanguageCode)} type="source"/>
      </FormField>
      <div className="flex justify-center">
        <Button size="small" variant="secondary" onClick={() => {
          if (!(targetLang in sourceLanguages)) return;
          setSourceLang(targetLang as sourceLanguageCode);
          setTargetLang(sourceLang as targetLanguageCode);
        }}>⇄ {t('translation.swap')}</Button>
      </div>
      <FormField label={t('translation.targetLanguage')} controlClassName="w-full">
        <LanguageSelector className="w-full" value={targetLang}
                          onChange={it => setTargetLang(it as targetLanguageCode)} type="target"/>
      </FormField>
      <Textarea className="w-full" value={text} onChange={e => {
        setText(e.target.value);
        module.updateTypingStatus(e.target.value);
      }} placeholder={t('translation.inputPlaceholder')} rows={3}/>
      <Button onClick={handleTranslate} disabled={loading}>
        {loading ? t('translation.translatingDecorated') : `▶ ${t('translation.translate')}`}
      </Button>
      <Textarea className="w-full" value={result} onChange={e => {
        setResult(e.target.value);
        module.updateTypingStatus(e.target.value);
      }} rows={3} placeholder={t('translation.outputPlaceholder')}/>
      <div className="rw-button-row">
        <Button onClick={() => navigator.clipboard.writeText(result)}>{t('common.copy')}</Button>
        <Button onClick={() => {
          module.clearTypingStatus();
          ServerSend('ChatRoomChat', {Content: result, Type: 'Chat'});
        }}>{t('translation.chatSend')}
        </Button>
        <Button onClick={() => {
          module.clearTypingStatus();
          ServerSend('ChatRoomChat', {Content: result, Type: 'Emote'});
        }}>{t('translation.activitySend')}
        </Button>
      </div>
    </div>
  );
}

function ConfigTab() {
  const {t} = useTranslation();
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
        ⚠ {t('translation.warning')}
      </div>

      <FormSectionTitle>{t('translation.switches')}</FormSectionTitle>
      <ToggleRowGroup>
        <ToggleRow checked={sendEnable} onChange={setSendEnable}>{t('translation.sendEnable')}</ToggleRow>
        <ToggleRow checked={receiveEnable} onChange={setReceiveEnable}>{t('translation.receiveEnable')}</ToggleRow>
        <ToggleRow checked={bioEnable} onChange={setBioEnable}>{t('translation.bioEnable')}</ToggleRow>
        <ToggleRow checked={bioVerticalLayout} onChange={setBioVerticalLayout}>{t('translation.bioVerticalLayout')}</ToggleRow>
        <ToggleRow checked={syncInputStatus} onChange={setSyncInputStatus}>{t('translation.syncInputStatus')}</ToggleRow>
      </ToggleRowGroup>

      <FormSectionTitle>{t('translation.sendLanguageSettings')}</FormSectionTitle>
      <FormField label={t('translation.sourceLanguage')} controlClassName="w-full">
        <LanguageSelector className="w-full" value={sendSourceLanguage}
                          onChange={it => setSendSourceLanguage(it as sourceLanguageCode)}
                          type="source"/>
      </FormField>
      <FormField label={t('translation.targetLanguage')} controlClassName="w-full">
        <LanguageSelector className="w-full" value={sendTargetLanguage}
                          onChange={it => setSendTargetLanguage(it as targetLanguageCode)}
                          type="target"/>
      </FormField>

      <FormSectionTitle>{t('translation.receiveLanguageSettings')}</FormSectionTitle>
      <FormField label={t('translation.sourceLanguage')} controlClassName="w-full">
        <LanguageSelector className="w-full" value={receiveSourceLanguage ?? ''}
                          onChange={it => setReceiveSourceLanguage(it as sourceLanguageCode)}
                          type="source"/>
      </FormField>
      <FormField label={t('translation.targetLanguage')} controlClassName="w-full">
        <LanguageSelector className="w-full" value={receiveTargetLanguage}
                          onChange={it => setReceiveTargetLanguage(it as targetLanguageCode)}
                          type="target"/>
      </FormField>
    </div>
  );
}

function ProviderTab() {
  const {t} = useTranslation();
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
      <FormField label={t('translation.provider')} controlClassName="w-full">
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
          <FormField label={t('translation.modelName')} controlClassName="w-full">
            <TextInput className="w-full" type="text" value={aiModel} onChange={e => setAiModel(e.target.value)}
                       placeholder="gpt-4o-mini"/>
          </FormField>
          <FormField label={t('translation.systemPrompt')} controlClassName="w-full">
            <Textarea className="w-full" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} rows={4}
                      placeholder={t('translation.promptPlaceholder')}/>
          </FormField>
        </>
      )}
    </div>
  );
}

export default function TranslationPage() {
  const {t} = useTranslation();

  return (
    <div>
      <p>{t('translation.title')}</p>
      <Tabs>
        <Tabs.Tab label={t('translation.testTab')}><TestTab/></Tabs.Tab>
        <Tabs.Tab label={t('translation.configTab')}><ConfigTab/></Tabs.Tab>
        <Tabs.Tab label={t('translation.providerTab')}><ProviderTab/></Tabs.Tab>
      </Tabs>
    </div>
  );
}
