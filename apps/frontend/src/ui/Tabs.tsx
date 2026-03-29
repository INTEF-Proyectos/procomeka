import { useState, useRef, useCallback, type ReactNode, type KeyboardEvent } from "react";
import "./Tabs.css";

export interface Tab {
  id: string;
  label: string;
  icon?: string;
  count?: number;
  content: ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, defaultTab, onChange, className = "" }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || "");
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const selectTab = useCallback((tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  }, [onChange]);

  const handleKeyDown = (e: KeyboardEvent, index: number) => {
    let nextIndex: number | null = null;

    if (e.key === "ArrowRight") {
      nextIndex = (index + 1) % tabs.length;
    } else if (e.key === "ArrowLeft") {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      const nextTab = tabs[nextIndex];
      selectTab(nextTab.id);
      tabRefs.current.get(nextTab.id)?.focus();
    }
  };

  const activeContent = tabs.find((t) => t.id === activeTab)?.content;

  return (
    <div className={`tabs ${className}`.trim()}>
      <div className="tabs-list" role="tablist">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(el) => { if (el) tabRefs.current.set(tab.id, el); }}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            className={`tabs-tab${activeTab === tab.id ? " tabs-tab-active" : ""}`}
            onClick={() => selectTab(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {tab.icon && (
              <span className="material-symbols-outlined tabs-tab-icon" aria-hidden="true">{tab.icon}</span>
            )}
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="tabs-tab-count">{tab.count}</span>
            )}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="tabs-panel"
      >
        {activeContent}
      </div>
    </div>
  );
}
