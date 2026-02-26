import {Children, type ReactElement, type ReactNode, useState} from "react";
import './tabs.css';

function Tab(_props: { label: string; children: ReactNode }) {
  return null;
}

function Tabs({children}: { children: ReactElement<{ label: string; children: ReactNode }>[] }) {
  const tabs = Children.map(children, c => ({label: c.props.label, content: c.props.children}));
  const [active, setActive] = useState(0);

  return (
    <>
      <div className="rw-tabs">
        {tabs.map((t, i) => (
          <button key={i} className={`rw-tab ${active === i ? 'rw-tab-active' : ''}`} onClick={() => setActive(i)}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="rw-tab-content">{tabs[active]?.content}</div>
    </>
  );
}

Tabs.Tab = Tab;
export default Tabs;