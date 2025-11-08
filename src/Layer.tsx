import React, { useState, useEffect } from 'react';
import './Layer.css';
import FloatingWindow from './components/FloatingWindow';
import LoadingProgress from './components/LoadingProgress';
import ModuleHeader from './components/ModuleHeader';
import ModuleList from './components/ModuleList';
import ModuleContent from './components/ModuleContent';
import { razorIsPro } from "./util/pro.ts";
import razorModSdk from "./razor-wings";
import main from "./main.tsx";
import { useGameState } from './hooks/useGameState';
import { useModuleManager } from './hooks/useModuleManager';

const Layer: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Use custom hooks for game state and module management
  const gameState = useGameState();
  const {
    availableModules,
    loadingState,
    currentOpenModule,
    openModule,
    closeModule
  } = useModuleManager(gameState);

  // Setup keyboard hook on mount
  useEffect(() => {
    razorModSdk.hookFunction('ChatRoomKeyDown', 10, (args, next) => {
      if (document.activeElement && main.overlay && main.overlay.contains(document.activeElement)) {
        return false;
      }
      return next(args);
    });
  }, []);

  // Toggle expand/collapse state
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <FloatingWindow
      isExpanded={isExpanded}
      onToggleExpanded={toggleExpanded}
      header={"Razor Wings" + (razorIsPro() ? ' Pro' : '')}
      collapsed="R"
      initialSize={{ width: 400, height: 300 }}
      minSize={{ width: 300, height: 200 }}
      maxSize={{ width: 1152, height: 864 }}
      resizable={true}
    >
      <LoadingProgress loadingState={loadingState} />

      <ModuleHeader
        currentModule={gameState.currentModule}
        currentScreen={gameState.currentScreen}
        showBackButton={currentOpenModule !== null}
        onBack={closeModule}
      />

      {currentOpenModule === null ? (
        <ModuleList
          modules={availableModules}
          onModuleClick={openModule}
        />
      ) : (
        <ModuleContent Component={currentOpenModule} />
      )}
    </FloatingWindow>
  );
};

export default Layer;
