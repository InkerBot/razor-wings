import {useState} from "react";
import {useTranslation} from "react-i18next";
import {extract} from "@/modules/chat_export/extractor.ts";
import Button from "@/components/Button";
import ToggleRow from "@/components/ToggleRow";

export default function ChatExportPage() {
  const {t} = useTranslation();
  const [includePrivate, setIncludePrivate] = useState<boolean>(false);
  return (<>
    <ToggleRow checked={includePrivate} onChange={setIncludePrivate}>{t('chatExport.includePrivate')}</ToggleRow>

    <Button onClick={() => extract(includePrivate)}>{t('chatExport.export')}</Button>
  </>)
}
