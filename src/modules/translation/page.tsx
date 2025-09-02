import {useEffect, useState} from "react";
import {type sourceLanguageCode, type targetLanguageCode} from "./languages.ts";
import LanguageSelector from "./LanguageSelector.tsx";
import module from "./module.ts";

export default function TranslationPage() {
  const [sendEnable, setSendEnable] = useState(module.sendEnable);
  const [sendSourceLanguage, setSendSourceLanguage] = useState<sourceLanguageCode>(module.sendSourceLanguage);
  const [sendTargetLanguage, setSendTargetLanguage] = useState<targetLanguageCode>(module.sendTargetLanguage);
  const [receiveEnable, setReceiveEnable] = useState(module.receiveEnable);
  const [receiveSourceLanguage, setReceiveSourceLanguage] = useState<sourceLanguageCode | null>(module.receiveSourceLanguage);
  const [receiveTargetLanguage, setReceiveTargetLanguage] = useState<targetLanguageCode>(module.receiveTargetLanguage);

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
    module.receiveSourceLanguage = receiveSourceLanguage;
    module.saveConfig();
  }, [receiveSourceLanguage]);
  useEffect(() => {
    module.receiveTargetLanguage = receiveTargetLanguage;
    module.saveConfig();
  }, [receiveTargetLanguage]);
  return (
    <div>
      <p>翻译</p>
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
