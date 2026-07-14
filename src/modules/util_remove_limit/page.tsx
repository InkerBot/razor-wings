import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import module, {switchEntries} from "@/modules/util_remove_limit/module.ts";
import {razorIsPro} from "@/util/pro.ts";
import ToggleRow from "@/components/ToggleRow";

export default function UtilRemoveLimitPage() {
  const {t} = useTranslation();
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
    <p>{t('removeLimit.description')}</p>
    {razorIsPro() && switchEntries.map(entry => (
      <ToggleRow
        key={entry.name}
        checked={switchStates[entry.name] || false}
        onChange={checked => handleSwitchChange(entry.name, checked)}
      >
        {t(`removeLimit.switches.${entry.name}`, {defaultValue: entry.name})}
      </ToggleRow>
    ))
    }
    {!razorIsPro() && <p>{t('removeLimit.unavailable')}</p>}
  </>);
}
