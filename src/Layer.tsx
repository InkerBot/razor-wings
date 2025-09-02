import React, {Component, type JSX} from 'react';
import './Layer.css';
import modules, {type ModuleConfig} from "./modules.ts";
import waitFor from "./util/waitFor.ts";
import FloatingWindow from './components/FloatingWindow';
import {razorIsPro} from "./util/pro.ts";

interface LayerState {
  isExpanded: boolean;
  currentModule: ModuleType | null;
  currentScreen: RoomName | null;
  availableModules: ModuleConfig[];
  currentOpenModule: JSX.Element | null;
  isPlayLogin: boolean;
  modulesLoading: boolean;
  loadedModulesCount: number;
  totalModulesCount: number;
}

class Layer extends Component<object, LayerState> {
  private moduleDetectionInterval: number | null = null;

  constructor(props: object) {
    super(props);
    this.state = {
      isExpanded: false,
      currentModule: null,
      currentScreen: null,
      availableModules: [],
      currentOpenModule: null,
      isPlayLogin: false,
      modulesLoading: true,
      loadedModulesCount: 0,
      totalModulesCount: 0
    };
  }

  componentDidMount() {
    this.startModuleDetection();
    this.checkPlayerLogin();
    this.initializeModules();
  }

  componentWillUnmount() {
    if (this.moduleDetectionInterval) {
      clearInterval(this.moduleDetectionInterval);
    }
  }

  componentDidUpdate(prevProps: object, prevState: LayerState) {
    if (
      prevState.currentModule !== this.state.currentModule ||
      prevState.currentScreen !== this.state.currentScreen ||
      prevState.isPlayLogin !== this.state.isPlayLogin
    ) {
      this.updateAvailableModules();
    }

    if (prevState.isPlayLogin !== this.state.isPlayLogin && this.state.isPlayLogin) {
      this.initModulesAfterLogin();
    }
  }

  // Detect current module and screen
  startModuleDetection = () => {
    this.moduleDetectionInterval = setInterval(() => {
      if (typeof CurrentModule !== 'undefined' && typeof CurrentScreen !== 'undefined') {
        this.setState({
          currentModule: CurrentModule,
          currentScreen: CurrentScreen
        });
      }
    }, 100);
  };

  // Update available modules based on current module and screen
  updateAvailableModules = () => {
    const availableModules = Object.entries(modules)
      .filter(([, value]) => (value.module.includes('*') || value.module.includes(this.state.currentModule))
        && (value.screen.includes('*') || value.screen.includes(this.state.currentScreen)))
      .filter(([, value]) => value.precondition ? value.precondition() : this.state.isPlayLogin)
      .map(([, value]) => value);

    this.setState({availableModules});
  };

  // Check player login
  checkPlayerLogin = async () => {
    try {
      await waitFor(() => Player && Player.Name != '');
      this.setState({isPlayLogin: true});
    } catch (error) {
      console.error(error);
    }
  };

  // Initialize modules after player login
  initModulesAfterLogin = async () => {
    console.info('Player logged in, initializing Razor Wings modules...');

    try {
      for (const [moduleName, moduleConfig] of Object.entries(modules)) {
        if (moduleConfig.moduleProvider != null) {
          try {
            const module = await moduleConfig.moduleProvider();
            module.initAfterLogin?.();
          } catch (error) {
            console.error(`Error loading module ${moduleName}:`, error);
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Initialize all modules
  initializeModules = async () => {
    try {
      const moduleEntries = Object.entries(modules);
      const modulesWithProvider = moduleEntries.filter(([, config]) => config.moduleProvider != null);

      this.setState({
        totalModulesCount: modulesWithProvider.length,
        modulesLoading: true,
        loadedModulesCount: 0
      });

      for (const [moduleName, moduleConfig] of modulesWithProvider) {
        try {
          const module = await moduleConfig.moduleProvider();
          module.loadConfig();
          module.init();

          this.setState(prevState => ({
            loadedModulesCount: prevState.loadedModulesCount + 1
          }));
        } catch (error) {
          console.error(`Error initializing module ${moduleName}:`, error);
        }
      }

      this.setState({modulesLoading: false});
    } catch (error) {
      console.error(error);
    }
  };

  // Toggle expand/collapse state
  toggleExpanded = () => {
    this.setState({isExpanded: !this.state.isExpanded});
  };

  // Open specified module
  openModule = async (module: ModuleConfig) => {
    try {
      const Component = await module.pageProvider();
      this.setState({currentOpenModule: <Component/>});
    } catch (error) {
      console.error(`Error loading module page: ${module.displayName}`, error);
    }
  };

  // Return to module list
  returnToModuleList = () => {
    this.setState({currentOpenModule: null});
  };

  render() {
    const {
      isExpanded,
      currentModule,
      currentScreen,
      availableModules,
      currentOpenModule,
      modulesLoading,
      loadedModulesCount,
      totalModulesCount
    } = this.state;

    return (
      <FloatingWindow
        isExpanded={isExpanded}
        onToggleExpanded={this.toggleExpanded}
        title={"Razor Wings" + (razorIsPro() ? ' Pro' : '')}
        initialSize={{width: 400, height: 300}}
        minSize={{width: 300, height: 200}}
        maxSize={{width: 1152, height: 864}}
        resizable={true}
      >
        {modulesLoading && (
          <div className="module-loading">
            <div>Loading modules: {loadedModulesCount}/{totalModulesCount}</div>
            <div className="loading-progress">
              <div
                className="progress-bar"
                style={{width: `${totalModulesCount > 0 ? (loadedModulesCount / totalModulesCount) * 100 : 0}%`}}
              ></div>
            </div>
          </div>
        )}

        <div className="module-header">
          Current location: {currentModule ?? 'unknown'} - {currentScreen ?? 'unknown'}
          {currentOpenModule != null && (
            <button onClick={this.returnToModuleList}>
              Back
            </button>
          )}
        </div>

        {currentOpenModule == null ? (
          <ul className="module-list">
            {availableModules.map((module, index) => (
              <li key={index} onClick={() => this.openModule(module)}>
                {module.displayName}
              </li>
            ))}
          </ul>
        ) : (
          <div className="module-content">
            {currentOpenModule}
          </div>
        )}
      </FloatingWindow>
    );
  }
}

export default Layer;
