import {useState} from "react";
import {extract} from "./extractor.ts";

export default function ChatExportPage() {
  const [includePrivate, setIncludePrivate] = useState<boolean>(false);
  return (<>
    <label>
      <input type="checkbox" checked={includePrivate} onChange={e => setIncludePrivate(e.target.checked)}/>
      包含私聊消息
    </label>

    <button onClick={() => extract(includePrivate)}>run</button>
  </>)
}
