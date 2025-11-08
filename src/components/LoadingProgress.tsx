import React from 'react';
import type { ModuleLoadingState } from '../services/ModuleService.ts';

interface LoadingProgressProps {
  loadingState: ModuleLoadingState;
}

const LoadingProgress: React.FC<LoadingProgressProps> = ({ loadingState }) => {
  if (!loadingState.isLoading) {
    return null;
  }

  return (
    <div className="module-loading">
      <div>
        Loading modules: {loadingState.loadedCount}/{loadingState.totalCount}
      </div>
      <div className="loading-progress">
        <div
          className="progress-bar"
          style={{ width: `${loadingState.progress}%` }}
        />
      </div>
    </div>
  );
};

export default LoadingProgress;
