/**
 * useModuleManager Hook
 *
 * Provides module management functionality including:
 * - Available modules based on game state
 * - Module loading state
 * - Current open module
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import moduleService, { type ModuleLoadingState } from '../services/ModuleService.ts';
import type { ModuleConfig } from '../modules.ts';
import type { GameState } from '../services/GameStateService.ts';

export interface UseModuleManagerResult {
  // Available modules
  availableModules: ModuleConfig[];

  // Loading state
  loadingState: ModuleLoadingState;

  // Current open module
  currentOpenModule: React.ComponentType | null;

  // Actions
  openModule: (moduleConfig: ModuleConfig) => Promise<void>;
  closeModule: () => void;
}

export function useModuleManager(gameState: GameState): UseModuleManagerResult {
  const [loadingState, setLoadingState] = useState<ModuleLoadingState>(
    moduleService.getLoadingState()
  );
  const [currentOpenModule, setCurrentOpenModule] = useState<React.ComponentType | null>(null);

  // Calculate available modules based on game state
  const availableModules = useMemo(() => {
    return moduleService.filterAvailableModules(gameState);
  }, [gameState]);

  // Initialize modules on mount
  useEffect(() => {
    if (!moduleService.isInitialized()) {
      moduleService.initializeModules().catch(error => {
        console.error('Error initializing modules:', error);
      });
    }

    // Subscribe to loading state changes
    const unsubscribe = moduleService.subscribeToLoading(setLoadingState);

    return () => {
      unsubscribe();
    };
  }, []);

  // Initialize modules after login
  useEffect(() => {
    if (gameState.isPlayerLogin) {
      moduleService.initModulesAfterLogin().catch(error => {
        console.error('Error initializing modules after login:', error);
      });
    }
  }, [gameState.isPlayerLogin]);

  // Open a module
  const openModule = useCallback(async (moduleConfig: ModuleConfig) => {
    try {
      const Component = await moduleService.loadModulePage(moduleConfig);
      setCurrentOpenModule(() => Component);
    } catch (error) {
      console.error(`Error opening module: ${moduleConfig.displayName}`, error);
    }
  }, []);

  // Close current module
  const closeModule = useCallback(() => {
    setCurrentOpenModule(null);
  }, []);

  return {
    availableModules,
    loadingState,
    currentOpenModule,
    openModule,
    closeModule
  };
}
