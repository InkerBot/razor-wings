/**
 * useGameState Hook
 *
 * Provides access to game state (current module, screen, player login status)
 */

import { useEffect, useState } from 'react';
import gameStateService, { type GameState } from '../services/GameStateService.ts';

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(
    gameStateService.getState()
  );

  useEffect(() => {
    // Subscribe to game state changes
    const unsubscribe = gameStateService.subscribe(setGameState);

    // Start detection if not already started
    gameStateService.startDetection();

    // Start waiting for player login
    gameStateService.waitForPlayerLogin().catch(error => {
      console.error('Error waiting for player login:', error);
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  return gameState;
}
