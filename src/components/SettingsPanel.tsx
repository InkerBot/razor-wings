import React, { useState, useEffect, useCallback } from 'react';
import { loadSettings, saveSettings, applySettings, type UserSettings } from '../settings';

interface Props {
  onClose: () => void;
  /** The shadow root's host or document element to apply CSS vars to */
  styleRoot: HTMLElement;
}

const ACCENT_OPTIONS: { value: string; label: string; color: string }[] = [
  { value: 'cyan',   label: 'Cyan',   color: '#00e5ff' },
  { value: 'blue',   label: 'Blue',   color: '#448aff' },
  { value: 'purple', label: 'Purple', color: '#7c4dff' },
  { value: 'green',  label: 'Green',  color: '#00e676' },
  { value: 'red',    label: 'Red',    color: '#ff4444' },
  { value: 'pink',   label: 'Pink',   color: '#ff80ab' },
];

const THEME_OPTIONS: { value: 'dark' | 'light'; label: string; icon: string }[] = [
  { value: 'dark',  label: '深色', icon: '🌙' },
  { value: 'light', label: '浅色', icon: '☀️' },
];

const SettingsPanel: React.FC<Props> = ({ onClose, styleRoot }) => {
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());

  const update = useCallback((patch: Partial<UserSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
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
    <div className="settings-overlay">
      <div className="settings-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="settings-back-btn" onClick={onClose} title="返回主菜单">←</button>
          <h3>Settings</h3>
        </div>
        <button className="settings-close-btn" onClick={onClose}>✕</button>
      </div>
      <div className="settings-body">

        {/* Font Size */}
        <div className="form-section-title">Typography</div>
        <div className="form-group">
          <label>字号大小</label>
          <div className="form-control" style={{ gap: '8px' }}>
            <input
              type="range"
              min="12"
              max="20"
              step="1"
              value={settings.fontSize}
              onChange={e => update({ fontSize: Number(e.target.value) })}
              style={{ flex: 1 }}
            />
            <span className="settings-shortcut" style={{ width: 32, textAlign: 'center' }}>
              {settings.fontSize}px
            </span>
          </div>
        </div>

        {/* Theme Mode — Dark / Light */}
        <div className="form-section-title rw-mt-3">Theme</div>
        <div className="form-group">
          <label>主题模式</label>
          <div className="form-control" style={{ gap: '4px' }}>
            {THEME_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={settings.themeMode === opt.value ? 'primary' : 'secondary'}
                onClick={() => update({ themeMode: opt.value })}
                style={{ flex: 1, fontSize: '13px', padding: '6px 8px' }}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accent Color */}
        <div className="form-group">
          <label>主题色</label>
          <div className="form-control accent-grid">
            {ACCENT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={settings.accentColor === opt.value ? 'accent-btn active' : 'accent-btn'}
                onClick={() => update({ accentColor: opt.value })}
                title={opt.label}
              >
                <span className="accent-dot" style={{ background: opt.color }} />
                <span className="accent-label">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Background Opacity */}
        <div className="form-section-title rw-mt-3">Appearance</div>
        <div className="form-group">
          <label>背景透明度</label>
          <div className="form-control" style={{ gap: '8px' }}>
            <input
              type="range"
              min="70"
              max="100"
              step="1"
              value={Math.round(settings.bgOpacity * 100)}
              onChange={e => update({ bgOpacity: Number(e.target.value) / 100 })}
              style={{ flex: 1 }}
            />
            <span className="settings-shortcut" style={{ width: 32, textAlign: 'center' }}>
              {Math.round(settings.bgOpacity * 100)}%
            </span>
          </div>
        </div>

        {/* Backdrop Blur */}
        <div className="form-group">
          <label>毛玻璃模糊</label>
          <div className="form-control" style={{ gap: '8px' }}>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={settings.backdropBlur}
              onChange={e => update({ backdropBlur: Number(e.target.value) })}
              style={{ flex: 1 }}
            />
            <span className="settings-shortcut" style={{ width: 28, textAlign: 'center' }}>
              {settings.backdropBlur}px
            </span>
          </div>
        </div>

        {/* Glow Intensity */}
        <div className="form-group">
          <label>发光强度</label>
          <div className="form-control" style={{ gap: '8px' }}>
            <input
              type="range"
              min="0"
              max="2"
              step="0.25"
              value={settings.glowIntensity}
              onChange={e => update({ glowIntensity: Number(e.target.value) })}
              style={{ flex: 1 }}
            />
            <span className="settings-shortcut" style={{ width: 28, textAlign: 'center' }}>
              {settings.glowIntensity}x
            </span>
          </div>
        </div>

        {/* Animations Toggle */}
        <div className="form-section-title rw-mt-3">Effects</div>
        <div className="form-group">
          <label>菜单动画</label>
          <div className="form-control">
            <label className="toggle-row">
              <span>启用切换动画</span>
              <span className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.enableAnimations}
                  onChange={e => update({ enableAnimations: e.target.checked })}
                />
                <span className="toggle-slider" />
              </span>
            </label>
          </div>
        </div>

        {/* Reset button */}
        <div className="rw-mt-3" style={{ display: 'flex', justifyContent: 'center' }}>
          <button className="secondary small" onClick={handleReset}>
            ↺ 恢复默认
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
