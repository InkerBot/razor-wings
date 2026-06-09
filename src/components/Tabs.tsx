import {Children, type ReactElement, type ReactNode, useState} from "react";
import {cn} from "@/util/cn";

type TabProps = { label: string; children: ReactNode };

function Tab(props: TabProps) {
  void props;
  return null;
}

function Tabs({children}: { children: ReactElement<TabProps>[] }) {
  const tabs = Children.map(children, c => ({label: c.props.label, content: c.props.children}));
  const [active, setActive] = useState(0);

  return (
    <>
      <div className="rw-tabs-list">
        {tabs.map((t, i) => (
          <button
            key={i}
            className={cn("rw-tab-button", active === i && "rw-tab-button--active")}
            onClick={() => setActive(i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="rw-tabs-panel">{tabs[active]?.content}</div>
    </>
  );
}

Tabs.Tab = Tab;
export default Tabs;
