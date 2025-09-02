import {useEffect, useState} from "react";
import module, {switchEntries} from "./module.ts";
import {razorIsPro} from "../../util/pro.ts";

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
        <div key={entry.name}>
          <label>
            <input
              type="checkbox"
              checked={switchStates[entry.name] || false}
              onChange={(e) => handleSwitchChange(entry.name, e.target.checked)}
            />
            {entry.description}
          </label>
        </div>
      ))
    }
    {!razorIsPro() && <p>非常抱歉，目前本功能暂不开放。在重新考虑社区意见之后，可能会重新开放。</p>}
  </>);
}
