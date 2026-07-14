import React, {useEffect, useRef, useState, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import FloatingWindow from '@/components/FloatingWindow';
import LoadingProgress from '@/components/LoadingProgress';
import LoadingScreen from '@/components/LoadingScreen';
import ModuleHeader from '@/components/ModuleHeader';
import ModuleList from '@/components/ModuleList';
import ModuleContent from '@/components/ModuleContent';
import SettingsPanel from '@/components/SettingsPanel';
import {ViewPanel, ViewTransition} from '@/components/ViewTransition';
import {applySettings, loadSettings, loadGeometry, saveGeometry, type WindowGeometry} from '@/settings';
import {razorIsPro} from "@/util/pro.ts";
import type {ModuleConfig} from "@/modules.ts";
import razorModSdk from "@/razor-wings";
import main from "@/main.tsx";
import {useGameState} from '@/hooks/useGameState';
import {useModuleManager} from '@/hooks/useModuleManager';

const Layer: React.FC = () => {
  const {t} = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  type NavDir = 'forward' | 'backward' | null;
  const [navDir, setNavDir] = useState<NavDir>(null);

  // Read animation setting fresh from storage each render so toggles apply immediately
  const enableAnimations = loadSettings().enableAnimations;

  // ── Window geometry persistence ──
  // Sensible first-load default; once the user moves/resizes the window we
  // save it to localStorage and restore it on the next load so the window
  // remembers its position and (expanded) size across BC page refreshes.
  const DEFAULT_WINDOW_SIZE = {width: 600, height: 780};
  const DEFAULT_WINDOW_POSITION = {x: 30, y: 30};
  const savedGeo = useRef<WindowGeometry>(
    loadGeometry() ?? {
      position: {...DEFAULT_WINDOW_POSITION},
      size: {...DEFAULT_WINDOW_SIZE},
      expanded: false,
    }
  );
  const persistGeometry = useCallback((patch: Partial<WindowGeometry>) => {
    const next = {...savedGeo.current, ...patch};
    savedGeo.current = next;
    saveGeometry(next);
  }, []);

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
      setShowLoading(loadSettings().enableBootAnimation);
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
  };
  const finishLoading = () => setShowLoading(false);

  const listAnimation = enableAnimations && navDir === 'forward'
    ? 'forward'
    : enableAnimations && navDir === 'backward'
      ? 'backward'
      : false;
  const contentAnimation = enableAnimations && navDir === 'forward' ? 'forward' : false;
  const settingsAnimation = enableAnimations ? 'fade' : false;

  const headerConfig = {
    title: t('common.appName') + (razorIsPro() ? ' Pro' : ''),
    actions: (
      <button
        className="rw-icon-button rw-icon-button--plain"
        onClick={toggleSettings}
        title={t('common.settings')}
      >
        ⚙
      </button>
    ),
  };

  return (
    <FloatingWindow
      isExpanded={isExpanded}
      onToggleExpanded={toggleExpanded}
      enableAnimations={enableAnimations}
      header={headerConfig}
      collapsed="R"
      initialPosition={savedGeo.current.position}
      initialSize={savedGeo.current.size}
      onMove={(position) => persistGeometry({position})}
      onResize={(size) => persistGeometry({size})}
      minSize={{width: 320, height: 240}}
      maxSize={{width: 1152, height: 864}}
      resizable={true}
      overlays={
        <>
          {/* Sci-fi boot animation */}
          {showLoading && <LoadingScreen onComplete={finishLoading}/>}

          {/* Settings overlay with fade animation — rendered outside the
              scaled inner wrapper so its backdrop-filter works */}
          {showSettings && (
            <ViewPanel
              animation={settingsAnimation}
              className="absolute inset-0 z-[var(--rw-z-settings)]"
              key="settings"
            >
              <SettingsPanel
                onClose={closeSettings}
                styleRoot={main.overlay!}
              />
            </ViewPanel>
          )}
        </>
      }
    >
      <LoadingProgress loadingState={loadingState}/>

      <ModuleHeader
        currentModule={gameState.currentModule}
        currentScreen={gameState.currentScreen}
        showBackButton={currentOpenModule !== null}
        onBack={handleCloseModule}
      />

      {/* ── Animated content area ── */}
      <ViewTransition>
        {currentOpenModule === null ? (
          <ViewPanel animation={listAnimation} key="list">
            <ModuleList
              modules={availableModules}
              onModuleClick={handleOpenModule}
            />
          </ViewPanel>
        ) : (
          <ViewPanel animation={contentAnimation} key="content">
            <ModuleContent Component={currentOpenModule}/>
          </ViewPanel>
        )}
      </ViewTransition>
    </FloatingWindow>
  );
};

export default Layer;
