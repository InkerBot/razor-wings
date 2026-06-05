import React from 'react';
import type {ModuleConfig} from '../modules.ts';

interface ModuleListProps {
  modules: ModuleConfig[];
  onModuleClick: (module: ModuleConfig) => void;
}

/* ── Sci-fi linear SVG icons (16x16 viewBox, stroke-based) ── */
const SVGIcon: React.FC<{ d: string }> = ({d}) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
       strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);

const ICONS: Record<string, string> = {
  '翻译': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10M12 2a15 15 0 0 0-4 10 15 15 0 0 0 4 10',
  '隐私设置': 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  '辅助_退出房间': 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9',
  '辅助_解锁': 'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0',
  '辅助_上锁': 'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 9.9-1',
  '辅助_外观编辑器': 'M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z',
  '辅助_解除限制': 'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3m0 0a22 22 0 0 1 4-4m-4 4 4 4',
  '辅助_移除奴隶': 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m16 0v-2M22 11l-4-4m0 0-4 4m4-4v13m-14-1a4 4 0 0 1 0-8',
  '工具_陷阱': 'M22 2 11 13m11-11-7 7M22 2l-4.5 16.5L14 14 2 8.5Z',
  '聊天导出': 'M22 12h-4l-3 9L9 3l-3 9H2',
  '地图脚本': 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z',
  '外观记录': 'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  '郊狼': 'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
  '作弊_获得所有物品': 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  '强制开启绒语翻译器': 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
};

function getIconId(displayName: string): string | null {
  if (ICONS[displayName]) return displayName;
  for (const prefix of Object.keys(ICONS)) {
    if (displayName.startsWith(prefix)) return prefix;
  }
  return null;
}

const CATEGORIES: Record<string, string> = {
  '辅助_': 'AUX',
  '工具_': 'TOOLS',
  '作弊_': 'CHEAT',
};

function getCategory(displayName: string): string | null {
  for (const [prefix, label] of Object.entries(CATEGORIES)) {
    if (displayName.startsWith(prefix)) return label;
  }
  return null;
}

function getCleanName(displayName: string): string {
  for (const prefix of Object.keys(CATEGORIES)) {
    if (displayName.startsWith(prefix)) return displayName.slice(prefix.length);
  }
  return displayName;
}

interface GroupedModules {
  category: string | null;
  items: ModuleConfig[];
}

function groupModules(modules: ModuleConfig[]): GroupedModules[] {
  const groups: GroupedModules[] = [];
  let currentCategory: string | null = null;
  let currentItems: ModuleConfig[] = [];

  for (const mod of modules) {
    const cat = getCategory(mod.displayName);
    if (cat !== currentCategory) {
      if (currentItems.length > 0) groups.push({category: currentCategory, items: currentItems});
      currentCategory = cat;
      currentItems = [];
    }
    currentItems.push(mod);
  }
  if (currentItems.length > 0) groups.push({category: currentCategory, items: currentItems});
  return groups;
}

const ModuleList: React.FC<ModuleListProps> = ({ modules, onModuleClick }) => {
  if (modules.length === 0) {
    return <div className="module-list-empty">NO MODULES AVAILABLE IN CURRENT CONTEXT</div>;
  }

  const groups = groupModules(modules);
  const hasMultipleGroups = groups.length > 1;

  return (
    <ul className="module-list">
      {groups.map((group, groupIndex) => (
        <React.Fragment key={groupIndex}>
          {hasMultipleGroups && group.category && (
            <li className="module-category">
              [{group.category}]
            </li>
          )}
          {group.items.map((module, index) => {
            const iconId = getIconId(module.displayName);
            return (
              <li key={`${groupIndex}-${index}`} onClick={() => onModuleClick(module)}>
                <span className="module-icon">
                  {iconId && <SVGIcon d={ICONS[iconId]}/>}
                </span>
                <span>{getCleanName(module.displayName)}</span>
              </li>
            );
          })}
        </React.Fragment>
      ))}
    </ul>
  );
};

export default ModuleList;
