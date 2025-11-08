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
    <div className="module-header">
      Current location: {currentModule ?? 'unknown'} - {currentScreen ?? 'unknown'}
      {showBackButton && (
        <button onClick={onBack}>
          Back
        </button>
      )}
    </div>
  );
};

export default ModuleHeader;
