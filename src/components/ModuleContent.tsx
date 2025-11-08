import React from 'react';

interface ModuleContentProps {
  Component: React.ComponentType | null;
}

const ModuleContent: React.FC<ModuleContentProps> = ({ Component }) => {
  if (!Component) {
    return null;
  }

  return (
    <div className="module-content">
      <Component />
    </div>
  );
};

export default ModuleContent;
