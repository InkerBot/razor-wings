const STORAGE_KEY = 'rw_settings';

export interface UserSettings {
  fontSize: number;          // 12-20, default 14
  bgOpacity: number;         // 0.7-1.0, default 0.94
  accentColor: string;       // cyan | blue | purple | green | red | pink
  glowIntensity: number;     // 0-2, default 1
  showScanlines: boolean;    // default true (hardcoded ON)
  backdropBlur: number;      // 0-20, default 16 (px)
  enableAnimations: boolean; // default true
  themeMode: 'dark' | 'light'; // default 'dark'
}

const DEFAULTS: UserSettings = {
  fontSize: 14,
  bgOpacity: 0.94,
  accentColor: 'cyan',
  glowIntensity: 1,
  showScanlines: true,
  backdropBlur: 16,
  enableAnimations: true,
  themeMode: 'dark',
};

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { /* empty */ }
  return { ...DEFAULTS };
}

export function saveSettings(s: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch { /* empty */ }
}

export function applySettings(s: UserSettings, root: HTMLElement): void {
  const style = root.style;
  const isLight = s.themeMode === 'light';

  style.setProperty('--rw-font-size-base', s.fontSize + 'px');
  style.setProperty('--rw-font-size-sm', (s.fontSize - 2) + 'px');
  style.setProperty('--rw-font-size-xs', (s.fontSize - 3) + 'px');
  style.setProperty('--rw-font-size-md', (s.fontSize + 1) + 'px');
  style.setProperty('--rw-font-size-lg', (s.fontSize + 2) + 'px');

  const accentMap: Record<string, { primary: string; dim: string; glow: string; glowStrong: string }> = {
    cyan:   { primary: '#00e5ff', dim: '#0097a7', glow: 'rgba(0,229,255,0.35)',    glowStrong: 'rgba(0,229,255,0.55)' },
    blue:   { primary: '#448aff', dim: '#2962ff', glow: 'rgba(68,138,255,0.35)',   glowStrong: 'rgba(68,138,255,0.55)' },
    purple: { primary: '#7c4dff', dim: '#651fff', glow: 'rgba(124,77,255,0.35)',   glowStrong: 'rgba(124,77,255,0.55)' },
    green:  { primary: '#00e676', dim: '#00c853', glow: 'rgba(0,230,118,0.35)',    glowStrong: 'rgba(0,230,118,0.55)' },
    red:    { primary: '#ff4444', dim: '#cc0000', glow: 'rgba(255,68,68,0.35)',    glowStrong: 'rgba(255,68,68,0.55)' },
    pink:   { primary: '#ff80ab', dim: '#f50057', glow: 'rgba(255,128,171,0.35)',  glowStrong: 'rgba(255,128,171,0.55)' },
  };
  const a = accentMap[s.accentColor] || accentMap.cyan;
  style.setProperty('--rw-neon-cyan', a.primary);
  style.setProperty('--rw-neon-cyan-dim', a.dim);
  style.setProperty('--rw-neon-cyan-glow', a.glow);
  style.setProperty('--rw-neon-cyan-glow-strong', a.glowStrong);

  const gi = s.glowIntensity;
  const glowRgb = hexToRgb(a.primary);
  style.setProperty('--rw-glow-cyan',       `0 0 ${8  * gi}px rgba(${glowRgb},${0.25 * gi}), 0 0 ${20 * gi}px rgba(${glowRgb},${0.1 * gi})`);
  style.setProperty('--rw-glow-cyan-strong',`0 0 ${12 * gi}px rgba(${glowRgb},${0.4  * gi}), 0 0 ${30 * gi}px rgba(${glowRgb},${0.15 * gi})`);

  if (isLight) {
    applyLightTheme(style, s, root);
  } else {
    applyDarkTheme(style, s, root);
  }

  style.setProperty('--rw-scanline-color', isLight ? 'rgba(0,0,0,0.03)' : 'rgba(0,229,255,0.04)');
  style.setProperty('--rw-scanline-display', 'block');

  style.setProperty('--rw-backdrop-blur', `blur(${s.backdropBlur}px)`);

  style.setProperty('--rw-anim-duration', s.enableAnimations ? 'var(--rw-anim-base, 220ms)' : '0ms');
}

function applyDarkTheme(style: CSSStyleDeclaration, s: UserSettings, root: HTMLElement): void {
  const overlay = `rgba(8, 12, 20, ${s.bgOpacity})`;
  const card = `rgba(13, 19, 34, ${Math.min(1, s.bgOpacity - 0.04)})`;

  style.setProperty('--rw-surface-overlay', overlay);
  style.setProperty('--rw-surface-card', card);
  style.setProperty('--rw-surface-input', 'rgba(15, 23, 41, 0.8)');
  style.setProperty('--rw-surface-input-focus', 'rgba(15, 23, 41, 0.95)');
  style.setProperty('--rw-surface-header', 'linear-gradient(135deg, #0a1628 0%, #102040 50%, #0d1832 100%)');

  style.setProperty('--rw-bg-deep', '#080c14');
  style.setProperty('--rw-bg-panel', '#0d1322');
  style.setProperty('--rw-bg-card', '#111827');
  style.setProperty('--rw-bg-input', '#0f1729');
  style.setProperty('--rw-bg-hover', 'rgba(0, 229, 255, 0.08)');
  style.setProperty('--rw-bg-active', 'rgba(0, 229, 255, 0.14)');
  style.setProperty('--rw-bg-selected', 'rgba(0, 229, 255, 0.18)');

  style.setProperty('--rw-text-primary', '#e0e8f0');
  style.setProperty('--rw-text-secondary', '#8899aa');
  style.setProperty('--rw-text-muted', '#556677');
  style.setProperty('--rw-text-link', 'var(--rw-neon-cyan)');
  style.setProperty('--rw-text-link-hover', '#80f0ff');

  style.setProperty('--rw-border-color', 'rgba(0, 229, 255, 0.18)');
  style.setProperty('--rw-border-color-strong', 'rgba(0, 229, 255, 0.35)');
  style.setProperty('--rw-border-color-subtle', 'rgba(255, 255, 255, 0.06)');

  style.setProperty('--rw-shadow-sm', '0 1px 3px rgba(0, 0, 0, 0.5)');
  style.setProperty('--rw-shadow-md', '0 4px 16px rgba(0, 0, 0, 0.6)');
  style.setProperty('--rw-shadow-lg', '0 8px 32px rgba(0, 0, 0, 0.7)');

  style.setProperty('--rw-button-primary-bg', 'var(--rw-neon-cyan)');
  style.setProperty('--rw-button-primary-text', '#0a0a12');
  style.setProperty('--rw-button-secondary-bg', 'rgba(0, 229, 255, 0.08)');
  style.setProperty('--rw-button-secondary-text', 'var(--rw-neon-cyan)');

  // Restore secondary button hover style for dark mode
  style.setProperty('--rw-button-secondary-hover-bg', 'rgba(0, 229, 255, 0.16)');
  style.setProperty('--rw-button-secondary-hover-text', 'var(--rw-neon-cyan)');

  // Data attribute for CSS selectors
  root.setAttribute('data-theme', 'dark');
}

function applyLightTheme(style: CSSStyleDeclaration, s: UserSettings, root: HTMLElement): void {
  const overlayOpacity = Math.min(1, s.bgOpacity + 0.03); // slightly less transparent for light
  const overlay = `rgba(248, 250, 252, ${overlayOpacity})`;
  const card = `rgba(255, 255, 255, ${Math.min(1, overlayOpacity + 0.02)})`;

  style.setProperty('--rw-surface-overlay', overlay);
  style.setProperty('--rw-surface-card', card);
  style.setProperty('--rw-surface-input', 'rgba(240, 243, 248, 0.9)');
  style.setProperty('--rw-surface-input-focus', 'rgba(255, 255, 255, 0.95)');
  style.setProperty('--rw-surface-header', 'linear-gradient(135deg, #e8ecf2 0%, #dfe4f0 50%, #eef1f6 100%)');

  style.setProperty('--rw-bg-deep', '#eef1f6');
  style.setProperty('--rw-bg-panel', '#f5f7fa');
  style.setProperty('--rw-bg-card', '#ffffff');
  style.setProperty('--rw-bg-input', '#f0f3f8');
  style.setProperty('--rw-bg-hover', 'rgba(0, 0, 0, 0.04)');
  style.setProperty('--rw-bg-active', 'rgba(0, 0, 0, 0.08)');
  style.setProperty('--rw-bg-selected', 'rgba(0, 0, 0, 0.1)');

  style.setProperty('--rw-text-primary', '#1a1a2e');
  style.setProperty('--rw-text-secondary', '#555770');
  style.setProperty('--rw-text-muted', '#8888a0');
  style.setProperty('--rw-text-link', 'var(--rw-neon-cyan-dim)');
  style.setProperty('--rw-text-link-hover', 'var(--rw-neon-cyan)');

  style.setProperty('--rw-border-color', 'rgba(0, 0, 0, 0.1)');
  style.setProperty('--rw-border-color-strong', 'rgba(0, 0, 0, 0.18)');
  style.setProperty('--rw-border-color-subtle', 'rgba(0, 0, 0, 0.04)');

  style.setProperty('--rw-shadow-sm', '0 1px 3px rgba(0, 0, 0, 0.08)');
  style.setProperty('--rw-shadow-md', '0 4px 16px rgba(0, 0, 0, 0.1)');
  style.setProperty('--rw-shadow-lg', '0 8px 32px rgba(0, 0, 0, 0.12)');

  style.setProperty('--rw-button-primary-bg', 'var(--rw-neon-cyan-dim)');
  style.setProperty('--rw-button-primary-text', '#ffffff');
  style.setProperty('--rw-button-secondary-bg', 'rgba(0, 0, 0, 0.04)');
  style.setProperty('--rw-button-secondary-text', 'var(--rw-text-secondary)');
  style.setProperty('--rw-button-secondary-hover-bg', 'rgba(0, 0, 0, 0.08)');
  style.setProperty('--rw-button-secondary-hover-text', 'var(--rw-text-primary)');

  root.setAttribute('data-theme', 'light');
}

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}
