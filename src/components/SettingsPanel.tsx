import React, {useCallback, useEffect, useState} from 'react';
import {applySettings, loadSettings, saveSettings, type UserSettings} from '../settings';
import Button from './Button';
import {RangeInput} from './FieldControls';
import {FormField, FormSectionTitle} from './Form';
import ToggleRow from './ToggleRow';
import {cn} from "../util/cn";

interface Props {
  onClose: () => void;
  /** The shadow root's host or document element to apply CSS vars to */
  styleRoot: HTMLElement;
}

const ACCENT_OPTIONS: { value: string; label: string; color: string }[] = [
  {value: 'cyan', label: 'Cyan', color: '#00e5ff'},
  {value: 'blue', label: 'Blue', color: '#448aff'},
  {value: 'purple', label: 'Purple', color: '#7c4dff'},
  {value: 'green', label: 'Green', color: '#00e676'},
  {value: 'red', label: 'Red', color: '#ff4444'},
  {value: 'pink', label: 'Pink', color: '#ff80ab'},
];

const THEME_OPTIONS: { value: 'dark' | 'light'; label: string; icon: string }[] = [
  {value: 'dark', label: '深色', icon: '🌙'},
  {value: 'light', label: '浅色', icon: '☀️'},
];

const SettingsPanel: React.FC<Props> = ({onClose, styleRoot}) => {
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());

  const update = useCallback((patch: Partial<UserSettings>) => {
    setSettings(prev => {
      const next = {...prev, ...patch};
      saveSettings(next);
      applySettings(next, styleRoot);
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
      themeMode: 'dark',
    };
    setSettings(def);
    saveSettings(def);
    applySettings(def, styleRoot);
  };

  // Apply on mount
  useEffect(() => {
    applySettings(settings, styleRoot);
  }, []);

  return (
    <div className="rw-settings-panel">
      <div className="rw-settings-header">
        <div className="flex items-center gap-[8px]">
          <button
            className="rw-icon-button rw-icon-button--cyan"
            onClick={onClose}
            title="返回主菜单"
          >
            ←
          </button>
          <h3 className="rw-settings-title">Settings</h3>
        </div>
        <button
          className="rw-icon-button rw-icon-button--magenta"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-[var(--rw-space-3)]">

        {/* Font Size */}
        <FormSectionTitle>Typography</FormSectionTitle>
        <FormField label="字号大小" controlClassName="gap-[8px]">
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
        <FormSectionTitle className="mt-[var(--rw-space-3)]">Theme</FormSectionTitle>
        <FormField label="主题模式" controlClassName="gap-[4px]">
          {THEME_OPTIONS.map(opt => (
            <Button
              key={opt.value}
              variant={settings.themeMode === opt.value ? 'primary' : 'secondary'}
              onClick={() => update({themeMode: opt.value})}
              className="flex-1 px-[8px] py-[6px] text-[13px]"
            >
              {opt.icon} {opt.label}
            </Button>
          ))}
        </FormField>

        {/* Accent Color */}
        <FormField label="主题色" controlClassName="grid w-full grid-cols-3 gap-[6px]">
          {ACCENT_OPTIONS.map(opt => {
            const active = settings.accentColor === opt.value;
            return (
              <button
                key={opt.value}
                className={cn("rw-color-option", active && "rw-color-option--active")}
                onClick={() => update({accentColor: opt.value})}
                title={opt.label}
              >
                <span
                  className={cn("rw-color-swatch", active && "rw-color-swatch--active")}
                  style={{background: opt.color}}
                />
                <span className="text-[11px] font-[var(--rw-font-weight-medium)]">{opt.label}</span>
              </button>
            );
          })}
        </FormField>

        {/* Background Opacity */}
        <FormSectionTitle className="mt-[var(--rw-space-3)]">Appearance</FormSectionTitle>
        <FormField label="背景透明度" controlClassName="gap-[8px]">
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
        <FormField label="毛玻璃模糊" controlClassName="gap-[8px]">
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
        <FormField label="发光强度" controlClassName="gap-[8px]">
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
        <FormSectionTitle className="mt-[var(--rw-space-3)]">Effects</FormSectionTitle>
        <FormField label="菜单动画">
          <ToggleRow
            checked={settings.enableAnimations}
            onChange={enableAnimations => update({enableAnimations})}
          >
            启用切换动画
          </ToggleRow>
        </FormField>

        {/* Reset button */}
        <div className="mt-[var(--rw-space-3)] flex justify-center">
          <Button variant="secondary" size="small" onClick={handleReset}>
            ↺ 恢复默认
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
