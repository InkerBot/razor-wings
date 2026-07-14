import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import module from "@/modules/ungarbled_messages/module.ts";
import ToggleRow from "@/components/ToggleRow";

export default function UngarbledMessagesPage() {
  const {t} = useTranslation();
  const [enabled, setEnabled] = useState(module.enabled);

  useEffect(() => {
    module.enabled = enabled;
    module.saveConfig();
  }, [enabled]);

  return (
    <div>
      <p>{t('ungarbled.title')}</p>
      <p>{t('ungarbled.description')}</p>

      <ToggleRow checked={enabled} onChange={setEnabled}>{t('common.enable')}</ToggleRow>
    </div>
  );
}
