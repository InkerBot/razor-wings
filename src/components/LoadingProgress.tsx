import React from 'react';
import type {ModuleLoadingState} from '../services/ModuleService.ts';

interface LoadingProgressProps {
  loadingState: ModuleLoadingState;
}

const LoadingProgress: React.FC<LoadingProgressProps> = ({loadingState}) => {
  if (!loadingState.isLoading) {
    return null;
  }

  return (
    <div className="rw-loading-progress">
      <div>
        Loading modules: {loadingState.loadedCount}/{loadingState.totalCount}
      </div>
      <div className="rw-loading-bar mt-[var(--rw-space-1)]">
        <div
          className="rw-loading-bar-fill"
          style={{width: `${loadingState.progress}%`}}
        />
      </div>
    </div>
  );
};

export default LoadingProgress;
