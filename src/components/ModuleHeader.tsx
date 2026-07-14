import React from 'react';
import {useTranslation} from 'react-i18next';

interface ModuleHeaderProps {
  currentModule: ModuleType | null;
  currentScreen: RoomName | null;
  showBackButton: boolean;
  onBack: () => void;
}

const ModuleHeader: React.FC<ModuleHeaderProps> = ({
                                                     currentModule,
                                                     currentScreen,
                                                     showBackButton,
                                                     onBack
                                                   }) => {
  const {t} = useTranslation();

  return (
    <div className="rw-module-header">
      <span className="rw-module-header-location">
        {t('header.currentLocation', {
          module: currentModule ?? t('common.unknown'),
          screen: currentScreen ?? t('common.unknown'),
        })}
      </span>
      {showBackButton && (
        <button
          className="rw-module-back-button"
          onClick={onBack}
        >
          ← {t('common.back')}
        </button>
      )}
    </div>
  );
};

export default ModuleHeader;
