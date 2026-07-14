import React, {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {applySettings, loadSettings, saveSettings, type UserSettings} from '@/settings';
import Button from '@/components/Button';
import {RangeInput, Select} from '@/components/FieldControls';
import {FormField, FormSectionTitle} from '@/components/Form';
import ToggleRow from '@/components/ToggleRow';
import {cn} from "@/util/cn";
import i18n, {APP_LANGUAGES, normalizeAppLanguage} from "@/i18n";

interface Props {
  onClose: () => void;
  /** The shadow root's host or document element to apply CSS vars to */
  styleRoot: HTMLElement;
}

const ACCENT_OPTIONS: { value: string; labelKey: string; color: string }[] = [
  {value: 'cyan', labelKey: 'settings.accents.cyan', color: '#00e5ff'},
  {value: 'blue', labelKey: 'settings.accents.blue', color: '#448aff'},
  {value: 'purple', labelKey: 'settings.accents.purple', color: '#7c4dff'},
  {value: 'green', labelKey: 'settings.accents.green', color: '#00e676'},
  {value: 'red', labelKey: 'settings.accents.red', color: '#ff4444'},
  {value: 'pink', labelKey: 'settings.accents.pink', color: '#ff80ab'},
];

const THEME_OPTIONS: { value: 'dark' | 'light'; labelKey: string; icon: string }[] = [
  {value: 'dark', labelKey: 'settings.theme.dark', icon: '🌙'},
  {value: 'light', labelKey: 'settings.theme.light', icon: '☀️'},
];

const SettingsPanel: React.FC<Props> = ({onClose, styleRoot}) => {
  const {t} = useTranslation();
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());

  const update = useCallback((patch: Partial<UserSettings>) => {
    setSettings(prev => {
      const next = {...prev, ...patch};
      saveSettings(next);
      applySettings(next, styleRoot);
      if (patch.language) {
        void i18n.changeLanguage(normalizeAppLanguage(patch.language));
      }
      return next;
    });
  }, [styleRoot]);

  const handleReset = () => {
    const def: UserSettings = {
      fontSize: 14,
      bgOpacity: 0.94,
      accentColor: 'cyan',
      glowIntensity: 1,
      showScanlines: true,
      backdropBlur: 16,
      enableAnimations: true,
      enableBootAnimation: true,
      themeMode: 'dark',
      language: 'zh-CN',
    };
    setSettings(def);
    saveSettings(def);
    applySettings(def, styleRoot);
    void i18n.changeLanguage(def.language);
  };

  // Apply on mount
  useEffect(() => {
    applySettings(settings, styleRoot);
  }, []);

  return (
    <div className="rw-settings-panel">
      <div className="rw-settings-panel__inner">
        <div className="rw-settings-header">
          <div className="flex items-center gap-[8px]">
            <button
              className="rw-icon-button rw-icon-button--cyan"
              onClick={onClose}
              title={t('common.backToMainMenu')}
            >
              ←
            </button>
            <h3 className="rw-settings-title">{t('settings.title')}</h3>
          </div>
          <button
            className="rw-icon-button rw-icon-button--magenta"
            onClick={onClose}
            title={t('common.close')}
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-[var(--rw-space-3)]">

        {/* Font Size */}
        <FormSectionTitle>{t('settings.sections.typography')}</FormSectionTitle>
        <FormField label={t('settings.fields.fontSize')} controlClassName="gap-[8px]">
          <RangeInput
            min="12"
            max="20"
            step="1"
            value={settings.fontSize}
            onChange={e => update({fontSize: Number(e.target.value)})}
            className="flex-1"
          />
          <span className="rw-meter-value w-[32px]">
            {settings.fontSize}px
          </span>
        </FormField>

        {/* Theme Mode — Dark / Light */}
        <FormSectionTitle className="mt-[var(--rw-space-3)]">{t('settings.sections.theme')}</FormSectionTitle>
        <FormField label={t('settings.fields.themeMode')} controlClassName="gap-[4px]">
          {THEME_OPTIONS.map(opt => (
            <Button
              key={opt.value}
              variant={settings.themeMode === opt.value ? 'primary' : 'secondary'}
              onClick={() => update({themeMode: opt.value})}
              className="flex-1 px-[8px] py-[6px] text-[13px]"
            >
              {opt.icon} {t(opt.labelKey)}
            </Button>
          ))}
        </FormField>

        <FormField label={t('settings.fields.language')} controlClassName="w-full">
          <Select
            className="w-full"
            value={settings.language}
            onChange={e => update({language: normalizeAppLanguage(e.target.value)})}
          >
            {APP_LANGUAGES.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </FormField>

        {/* Accent Color */}
        <FormField label={t('settings.fields.accentColor')} controlClassName="grid w-full grid-cols-3 gap-[6px]">
          {ACCENT_OPTIONS.map(opt => {
            const active = settings.accentColor === opt.value;
            const label = t(opt.labelKey);
            return (
              <button
                key={opt.value}
                className={cn("rw-color-option", active && "rw-color-option--active")}
                onClick={() => update({accentColor: opt.value})}
                title={label}
              >
                <span
                  className={cn("rw-color-swatch", active && "rw-color-swatch--active")}
                  style={{background: opt.color}}
                />
                <span className="text-[11px] font-[var(--rw-font-weight-medium)]">{label}</span>
              </button>
            );
          })}
        </FormField>

        {/* Background Opacity */}
        <FormSectionTitle className="mt-[var(--rw-space-3)]">{t('settings.sections.appearance')}</FormSectionTitle>
        <FormField label={t('settings.fields.bgOpacity')} controlClassName="gap-[8px]">
          <RangeInput
            min="70"
            max="100"
            step="1"
            value={Math.round(settings.bgOpacity * 100)}
            onChange={e => update({bgOpacity: Number(e.target.value) / 100})}
            className="flex-1"
          />
          <span className="rw-meter-value w-[32px]">
            {Math.round(settings.bgOpacity * 100)}%
          </span>
        </FormField>

        {/* Backdrop Blur */}
        <FormField label={t('settings.fields.backdropBlur')} controlClassName="gap-[8px]">
          <RangeInput
            min="0"
            max="20"
            step="1"
            value={settings.backdropBlur}
            onChange={e => update({backdropBlur: Number(e.target.value)})}
            className="flex-1"
          />
          <span className="rw-meter-value w-[28px]">
            {settings.backdropBlur}px
          </span>
        </FormField>

        {/* Glow Intensity */}
        <FormField label={t('settings.fields.glowIntensity')} controlClassName="gap-[8px]">
          <RangeInput
            min="0"
            max="2"
            step="0.25"
            value={settings.glowIntensity}
            onChange={e => update({glowIntensity: Number(e.target.value)})}
            className="flex-1"
          />
          <span className="rw-meter-value w-[28px]">
            {settings.glowIntensity}x
          </span>
        </FormField>

        {/* Animations Toggle */}
        <FormSectionTitle className="mt-[var(--rw-space-3)]">{t('settings.sections.effects')}</FormSectionTitle>
        <FormField label={t('settings.fields.menuAnimation')}>
          <ToggleRow
            checked={settings.enableAnimations}
            onChange={enableAnimations => update({enableAnimations})}
          >
            {t('settings.enableAnimations')}
          </ToggleRow>
        </FormField>
        <FormField label={t('settings.fields.bootAnimation')}>
          <ToggleRow
            checked={settings.enableBootAnimation}
            onChange={enableBootAnimation => update({enableBootAnimation})}
          >
            {t('settings.enableBootAnimation')}
          </ToggleRow>
        </FormField>

        {/* Reset button */}
        <div className="mt-[var(--rw-space-3)] flex justify-center">
          <Button variant="secondary" size="small" onClick={handleReset}>
            ↺ {t('common.reset')}
          </Button>
        </div>
      </div>
    </div>
  </div>
  );
};

export default SettingsPanel;
