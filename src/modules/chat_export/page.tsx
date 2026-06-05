import {useState} from "react";
import {extract} from "./extractor.ts";

export default function ChatExportPage() {
  const [includePrivate, setIncludePrivate] = useState<boolean>(false);
  return (<>
    <label className="toggle-row">
      <span>包含私聊消息</span>
      <span className="toggle-switch">
        <input type="checkbox" checked={includePrivate} onChange={e => setIncludePrivate(e.target.checked)}/>
        <span className="toggle-slider"/>
      </span>
    </label>

    <button onClick={() => extract(includePrivate)}>run</button>
  </>)
}
