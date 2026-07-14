import React, {useEffect} from "react";
import {useTranslation} from "react-i18next";
import {Editor, loader} from "@monaco-editor/react";
import main from "@/main.tsx";

let isStyleInjected = false;

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function ScriptEditor({value, onChange}: Props) {
  const {t} = useTranslation();
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    loader.init().then(() => {
      if (!isStyleInjected) {
        const sourceStyle: HTMLStyleElement = document.querySelector('link[rel="stylesheet"][type="text/css"][data-name="vs/editor/editor.main"]');
        if (sourceStyle) {
          const style = document.createElement('link');
          style.rel = 'stylesheet';
          style.type = 'text/css';
          style['data-name'] = 'vs/editor/editor.main';
          style.href = sourceStyle['href'];
          main.shadowRoot.appendChild(style);
        }
        isStyleInjected = true;
      }
    }).catch((e) => {
      console.error("Monaco Editor failed to load:", e.message);
      setError(t('utilEditor.editorLoadFailed', {message: e.message}));
    });
  }, [t]);

  return (<>
    {error ? <p>{t('common.error')}: {error}</p> : <Editor
      height="100%"
      width="100%"
      value={value}
      onChange={onChange}
      options={{
        minimap: {enabled: false},
        tabCompletion: 'on'
      }}
      language="js"
      theme="vs-dark"
    />}
  </>);
}
