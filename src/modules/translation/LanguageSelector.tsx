import React from 'react';
import {useTranslation} from 'react-i18next';
import {type languageCode, sourceLanguages, targetLanguages} from "@/modules/translation/languages.ts";
import {Select} from "@/components/FieldControls";
import {cn} from "@/util/cn";

interface LanguageSelectorProps {
  value?: string;
  type?: 'source' | 'target';
  onChange?: (languageCode: languageCode) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
}

export default function LanguageSelector(
  {
    value = 'EN',
    type = 'target',
    onChange,
    className = '',
    disabled = false,
    placeholder = '',
    label,
  }: LanguageSelectorProps) {
  const availableLanguages = type === 'source' ? sourceLanguages : targetLanguages;
  const {t} = useTranslation();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    if (onChange) {
      onChange(newLanguage as languageCode);
    }
  };

  return (
    <div className={className}>
      {label && <label>{label}</label>}
      <Select
        className={cn("w-full", !className && "block")}
        value={value}
        onChange={handleLanguageChange}
        disabled={disabled}
      >
        <option value="">
          {placeholder || t('translation.selectLanguage')}
        </option>
        {Object.values(availableLanguages).map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </Select>
    </div>
  );
};
