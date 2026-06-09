import {useState} from "react";
import {extract} from "@/modules/chat_export/extractor.ts";
import Button from "@/components/Button";
import ToggleRow from "@/components/ToggleRow";

export default function ChatExportPage() {
  const [includePrivate, setIncludePrivate] = useState<boolean>(false);
  return (<>
    <ToggleRow checked={includePrivate} onChange={setIncludePrivate}>包含私聊消息</ToggleRow>

    <Button onClick={() => extract(includePrivate)}>run</Button>
  </>)
}
