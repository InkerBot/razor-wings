import React from 'react';

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
  return (
    <div className="rw-module-header">
      <span className="rw-module-header-location">
        Current location: {currentModule ?? 'unknown'} - {currentScreen ?? 'unknown'}
      </span>
      {showBackButton && (
        <button
          className="rw-module-back-button"
          onClick={onBack}
        >
          ← Back
        </button>
      )}
    </div>
  );
};

export default ModuleHeader;
