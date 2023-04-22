import { useState } from "react";
import { TabsProps } from "./tabs.schema.js";

export function Tabs({ label: labels, OutputsProvider }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <OutputsProvider activeIndex={0} activateIndex={setActiveIndex}>
      {({ TabPanel: TabPanels }) => {
        const TabPanel = TabPanels[activeIndex];
        return (
          <div className="tab-container">
            <div className="tab-list">
              {labels.map((label, i) => (
                <button key={i} onClick={() => setActiveIndex(i)}>
                  {label}
                </button>
              ))}
            </div>
            <div className="tab-panel">
              <TabPanel />
            </div>
          </div>
        );
      }}
    </OutputsProvider>
  );
}
