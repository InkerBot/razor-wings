import waitFor from "../util/waitFor.ts";

export type GameStateListener = (state: GameState) => void;

export interface GameState {
  currentModule: ModuleType | null;
  currentScreen: RoomName | null;
  isPlayerLogin: boolean;
}

class GameStateService {
  private listeners: Set<GameStateListener> = new Set();
  private detectionInterval: number | null = null;
  private currentState: GameState = {
    currentModule: null,
    currentScreen: null,
    isPlayerLogin: false
  };

  startDetection() {
    if (this.detectionInterval !== null) {
      return;
    }

    this.detectionInterval = setInterval(() => {
      if (typeof CurrentModule !== 'undefined' && typeof CurrentScreen !== 'undefined') {
        const newModule = CurrentModule;
        const newScreen = CurrentScreen;

        if (newModule !== this.currentState.currentModule ||
            newScreen !== this.currentState.currentScreen) {
          this.updateState({
            currentModule: newModule,
            currentScreen: newScreen
          });
        }
      }
    }, 100);
  }

  stopDetection() {
    if (this.detectionInterval !== null) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
  }

  async waitForPlayerLogin(): Promise<void> {
    try {
      await waitFor(() => Player && Player.Name != '');
      this.updateState({ isPlayerLogin: true });
    } catch (error) {
      console.error('Error waiting for player login:', error);
      throw error;
    }
  }

  subscribe(listener: GameStateListener): () => void {
    this.listeners.add(listener);
    // Immediately call listener with current state
    listener(this.currentState);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState(): GameState {
    return { ...this.currentState };
  }

  private updateState(partialState: Partial<GameState>) {
    const prevState = this.currentState;
    this.currentState = {
      ...this.currentState,
      ...partialState
    };

    // Notify listeners if state actually changed
    if (this.hasStateChanged(prevState, this.currentState)) {
      this.notifyListeners();
    }
  }

  private hasStateChanged(prev: GameState, current: GameState): boolean {
    return prev.currentModule !== current.currentModule ||
           prev.currentScreen !== current.currentScreen ||
           prev.isPlayerLogin !== current.isPlayerLogin;
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentState);
      } catch (error) {
        console.error('Error in game state listener:', error);
      }
    });
  }

  reset() {
    this.stopDetection();
    this.listeners.clear();
    this.currentState = {
      currentModule: null,
      currentScreen: null,
      isPlayerLogin: false
    };
  }
}

export const gameStateService = new GameStateService();
export default gameStateService;
