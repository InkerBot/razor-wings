import React, {useEffect} from "react";
import {Editor, loader} from "@monaco-editor/react";
import main from "../../main.tsx";

let isStyleInjected = false;

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function PlayerAppearanceEditor({value, onChange}: Props) {
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
      setError("Failed to load Monaco Editor: " + e.message);
    });
  }, []);

  return (<>
    {error ? <p>Error: {error}</p> : <Editor
      height="100%"
      width="100%"
      value={value}
      onChange={onChange}
      options={{
        minimap: {enabled: false},
        tabCompletion: 'on'
      }}
      language="json"
      theme="vs-dark"
      onMount={(editor, monaco) => {
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
          validate: true,
          schemas: [
            {
              uri: main.resourceUrl('appearance-schema.json'),
              fileMatch: ["**"]
            },
          ],
          enableSchemaRequest: true,
        });
      }}
    />}
  </>);
}
