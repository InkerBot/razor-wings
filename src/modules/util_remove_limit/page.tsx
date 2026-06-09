import {useEffect, useState} from "react";
import module, {switchEntries} from "@/modules/util_remove_limit/module.ts";
import {razorIsPro} from "@/util/pro.ts";
import ToggleRow from "@/components/ToggleRow";

export default function UtilRemoveLimitPage() {
  const [switchStates, setSwitchStates] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const initialStates: { [key: string]: boolean } = {};
    switchEntries.forEach(entry => {
      initialStates[entry.name] = module.enabled[entry.name];
    });
    setSwitchStates(initialStates);
  }, []);

  const handleSwitchChange = (name: string, isEnabled: boolean) => {
    setSwitchStates(prev => ({...prev, [name]: isEnabled}));
    module.enabled[name] = isEnabled;
    module.saveConfig();

    const entry = switchEntries.find(e => e.name === name);
    if (entry && entry.onUpdate) {
      entry.onUpdate(isEnabled);
    }
  };

  return (<>
    <p>此页面用于解除游戏中的各种限制</p>
    {razorIsPro() && switchEntries.map(entry => (
      <ToggleRow
        key={entry.name}
        checked={switchStates[entry.name] || false}
        onChange={checked => handleSwitchChange(entry.name, checked)}
      >
        {entry.description}
      </ToggleRow>
    ))
    }
    {!razorIsPro() && <p>非常抱歉，目前本功能暂不开放。在重新考虑社区意见之后，可能会重新开放。</p>}
  </>);
}
