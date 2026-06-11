import React from 'react';
import {useTranslation} from 'react-i18next';
import type {ModuleLoadingState} from '@/services/ModuleService.ts';

interface LoadingProgressProps {
  loadingState: ModuleLoadingState;
}

const LoadingProgress: React.FC<LoadingProgressProps> = ({loadingState}) => {
  const {t} = useTranslation();

  if (!loadingState.isLoading) {
    return null;
  }

  return (
    <div className="rw-loading-progress">
      <div>
        {t('loading.modules', {loaded: loadingState.loadedCount, total: loadingState.totalCount})}
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
