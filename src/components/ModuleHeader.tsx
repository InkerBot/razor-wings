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
      <span className="location-info">
        Current location: {currentModule ?? 'unknown'} - {currentScreen ?? 'unknown'}
      </span>
      {showBackButton && (
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
      )}
    </div>
  );
};

export default ModuleHeader;
