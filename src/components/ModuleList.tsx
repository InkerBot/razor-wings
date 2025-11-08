import React from 'react';
import type { ModuleConfig } from '../modules.ts';

interface ModuleListProps {
  modules: ModuleConfig[];
  onModuleClick: (module: ModuleConfig) => void;
}

const ModuleList: React.FC<ModuleListProps> = ({ modules, onModuleClick }) => {
  if (modules.length === 0) {
    return (
      <div className="module-list-empty">
        No modules available in current context
      </div>
    );
  }

  return (
    <ul className="module-list">
      {modules.map((module, index) => (
        <li key={index} onClick={() => onModuleClick(module)}>
          {module.displayName}
        </li>
      ))}
    </ul>
  );
};

export default ModuleList;
