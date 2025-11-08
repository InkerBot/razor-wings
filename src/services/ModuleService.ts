import modules, { type ModuleConfig } from "../modules.ts";
import type { GameState } from "./GameStateService.ts";

export interface ModuleLoadingState {
  isLoading: boolean;
  loadedCount: number;
  totalCount: number;
  progress: number; // 0-100
}

export type ModuleLoadingListener = (state: ModuleLoadingState) => void;

class ModuleService {
  private loadingListeners: Set<ModuleLoadingListener> = new Set();
  private loadingState: ModuleLoadingState = {
    isLoading: false,
    loadedCount: 0,
    totalCount: 0,
    progress: 0
  };
  private initialized = false;

  async initializeModules(): Promise<void> {
    if (this.initialized) {
      console.warn('Modules already initialized');
      return;
    }

    try {
      const moduleEntries = Object.entries(modules);
      const modulesWithProvider = moduleEntries.filter(
        ([, config]) => config.moduleProvider != null
      );

      this.updateLoadingState({
        isLoading: true,
        loadedCount: 0,
        totalCount: modulesWithProvider.length,
        progress: 0
      });

      for (const [moduleName, moduleConfig] of modulesWithProvider) {
        try {
          const module = await moduleConfig.moduleProvider();
          module.loadConfig();
          module.init();

          this.updateLoadingState({
            loadedCount: this.loadingState.loadedCount + 1,
            progress: Math.round(
              ((this.loadingState.loadedCount + 1) / this.loadingState.totalCount) * 100
            )
          });
        } catch (error) {
          console.error(`Error initializing module ${moduleName}:`, error);
        }
      }

      this.updateLoadingState({
        isLoading: false,
        progress: 100
      });

      this.initialized = true;
    } catch (error) {
      console.error('Error during module initialization:', error);
      this.updateLoadingState({
        isLoading: false
      });
      throw error;
    }
  }

  async initModulesAfterLogin(): Promise<void> {
    console.info('Player logged in, initializing Razor Wings modules...');

    try {
      const moduleEntries = Object.entries(modules);

      for (const [moduleName, moduleConfig] of moduleEntries) {
        if (moduleConfig.moduleProvider != null) {
          try {
            const module = await moduleConfig.moduleProvider();
            module.initAfterLogin?.();
          } catch (error) {
            console.error(`Error in initAfterLogin for module ${moduleName}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error during post-login module initialization:', error);
    }
  }

  filterAvailableModules(gameState: GameState): ModuleConfig[] {
    const { currentModule, currentScreen, isPlayerLogin } = gameState;

    return Object.entries(modules)
      .filter(([, config]) =>
        (config.module.includes('*') || config.module.includes(currentModule)) &&
        (config.screen.includes('*') || config.screen.includes(currentScreen))
      )
      .filter(([, config]) =>
        config.precondition ? config.precondition() : isPlayerLogin
      )
      .map(([, config]) => config);
  }

  async loadModulePage(moduleConfig: ModuleConfig): Promise<React.ComponentType> {
    try {
      return await moduleConfig.pageProvider();
    } catch (error) {
      console.error(`Error loading module page: ${moduleConfig.displayName}`, error);
      throw error;
    }
  }

  subscribeToLoading(listener: ModuleLoadingListener): () => void {
    this.loadingListeners.add(listener);
    // Immediately call listener with current state
    listener(this.loadingState);

    // Return unsubscribe function
    return () => {
      this.loadingListeners.delete(listener);
    };
  }

  getLoadingState(): ModuleLoadingState {
    return { ...this.loadingState };
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  private updateLoadingState(partialState: Partial<ModuleLoadingState>) {
    this.loadingState = {
      ...this.loadingState,
      ...partialState
    };

    this.notifyLoadingListeners();
  }

  private notifyLoadingListeners() {
    this.loadingListeners.forEach(listener => {
      try {
        listener(this.loadingState);
      } catch (error) {
        console.error('Error in module loading listener:', error);
      }
    });
  }

  reset() {
    this.loadingListeners.clear();
    this.loadingState = {
      isLoading: false,
      loadedCount: 0,
      totalCount: 0,
      progress: 0
    };
    this.initialized = false;
  }
}

export const moduleService = new ModuleService();
export default moduleService;
