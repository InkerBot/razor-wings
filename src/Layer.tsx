import React, {useEffect, useState} from 'react';
import FloatingWindow from './components/FloatingWindow';
import LoadingProgress from './components/LoadingProgress';
import LoadingScreen from './components/LoadingScreen';
import ModuleHeader from './components/ModuleHeader';
import ModuleList from './components/ModuleList';
import ModuleContent from './components/ModuleContent';
import SettingsPanel from './components/SettingsPanel';
import {applySettings, loadSettings} from './settings';
import {razorIsPro} from "./util/pro.ts";
import type {ModuleConfig} from "./modules.ts";
import razorModSdk from "./razor-wings";
import main from "./main.tsx";
import {useGameState} from './hooks/useGameState';
import {useModuleManager} from './hooks/useModuleManager';

const Layer: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  type NavDir = 'forward' | 'backward' | null;
  const [navDir, setNavDir] = useState<NavDir>(null);

  // Track animation setting from saved config
  const [enableAnimations, setEnableAnimations] = useState(() => loadSettings().enableAnimations);

  const gameState = useGameState();
  const {
    availableModules,
    loadingState,
    currentOpenModule,
    openModule: _openModule,
    closeModule: _closeModule
  } = useModuleManager(gameState);

  // Wrap open/close to inject direction tracking (only when animations enabled)
  const handleOpenModule = (m: ModuleConfig) => {
    if (enableAnimations) setNavDir('forward');
    _openModule(m);
  };
  const handleCloseModule = () => {
    if (enableAnimations) setNavDir('backward');
    _closeModule();
  };
  // Clear direction after animation completes
  useEffect(() => {
    if (navDir) {
      const t = setTimeout(() => setNavDir(null), 250);
      return () => clearTimeout(t);
    }
  }, [navDir, currentOpenModule]);

  // Setup keyboard hook
  useEffect(() => {
    razorModSdk.hookFunction('ChatRoomKeyDown', 10, (args, next) => {
      if (document.activeElement && main.overlay && main.overlay.contains(document.activeElement)) {
        return false;
      }
      return next(args);
    });
  }, []);

  // Apply saved settings on mount (target the shadow host so CSS vars reach inside Shadow DOM)
  useEffect(() => {
    const settings = loadSettings();
    applySettings(settings, main.overlay!);
  }, []);

  const toggleExpanded = () => {
    if (!isExpanded) {
      setShowLoading(true);
    }
    setIsExpanded(!isExpanded);
  };
  const toggleSettings = () => {
    if (enableAnimations) setNavDir('forward');
    setShowSettings(!showSettings);
  };
  const closeSettings = () => {
    if (enableAnimations) setNavDir('backward');
    setShowSettings(false);
    // Refresh animation setting after settings panel closes
    const s = loadSettings();
    setEnableAnimations(s.enableAnimations);
  };
  const finishLoading = () => setShowLoading(false);

  // Derive animation classes — only when animations are enabled
  const animForward = enableAnimations && navDir === 'forward' ? 'view-enter-forward' : '';
  const animBackward = enableAnimations && navDir === 'backward' ? 'view-enter-backward' : '';
  const animFade = enableAnimations ? 'view-enter-fade' : '';

  const headerConfig = {
    title: "Razor Wings" + (razorIsPro() ? ' Pro' : ''),
    actions: (
      <button className="settings-btn" onClick={toggleSettings} title="Settings">
        ⚙
      </button>
    ),
  };

  return (
    <FloatingWindow
      isExpanded={isExpanded}
      onToggleExpanded={toggleExpanded}
      header={headerConfig}
      collapsed="R"
      initialSize={{width: 520, height: 400}}
      minSize={{width: 320, height: 240}}
      maxSize={{ width: 1152, height: 864 }}
      resizable={true}
    >
      {/* Sci-fi boot animation */}
      {showLoading && <LoadingScreen onComplete={finishLoading}/>}

      <LoadingProgress loadingState={loadingState} />

      <ModuleHeader
        currentModule={gameState.currentModule}
        currentScreen={gameState.currentScreen}
        showBackButton={currentOpenModule !== null}
        onBack={handleCloseModule}
      />

      {/* ── Animated content area ── */}
      <div className="view-transition-wrap">
        {currentOpenModule === null ? (
          <div className={`view-panel ${animForward} ${animBackward}`} key="list">
            <ModuleList
              modules={availableModules}
              onModuleClick={handleOpenModule}
            />
          </div>
        ) : (
          <div className={`view-panel ${animForward}`} key="content">
            <ModuleContent Component={currentOpenModule}/>
          </div>
        )}
      </div>

      {/* Settings overlay with fade animation */}
      {showSettings && (
        <div className={`view-panel ${animFade}`} key="settings"
             style={{position: 'absolute', inset: 0, zIndex: 'var(--rw-z-settings)'}}>
          <SettingsPanel
            onClose={closeSettings}
            styleRoot={main.overlay!}
          />
        </div>
      )}
    </FloatingWindow>
  );
};

export default Layer;
