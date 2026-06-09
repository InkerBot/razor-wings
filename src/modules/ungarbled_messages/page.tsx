import {useEffect, useState} from "react";
import module from "@/modules/ungarbled_messages/module.ts";
import ToggleRow from "@/components/ToggleRow";

export default function UngarbledMessagesPage() {
  const [enabled, setEnabled] = useState(module.enabled);

  useEffect(() => {
    module.enabled = enabled;
    module.saveConfig();
  }, [enabled]);

  return (
    <div>
      <p>显示未加扰消息</p>
      <p>此功能可以显示被口球等道具加扰前的原始消息内容。</p>

      <ToggleRow checked={enabled} onChange={setEnabled}>启用</ToggleRow>
    </div>
  );
}
