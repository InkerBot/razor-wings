import React from 'react';
import {type languageCode, sourceLanguages, targetLanguages} from "./languages.ts";

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
    placeholder = 'select language',
    label,
  }: LanguageSelectorProps) {
  const availableLanguages = type === 'source' ? sourceLanguages : targetLanguages;

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    if (onChange) {
      onChange(newLanguage as languageCode);
    }
  };

  return (
    <div className={className}>
      {label && <label>{label}</label>}
      <select
        className="language-selector-select"
        value={value}
        onChange={handleLanguageChange}
        disabled={disabled}
      >
        <option value="">
          {placeholder}
        </option>
        {Object.values(availableLanguages).map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};
