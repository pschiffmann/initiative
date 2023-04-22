import { useState } from "react";
import { TabsProps } from "./tabs.schema.js";

export function Tabs({ label, slots, OutputsProvider }: TabsProps) {
  const [activeTabPanel, setActiveTabPanel] = useState("");

  return (
    <OutputsProvider
      activeTabPanel={activeTabPanel}
      activateTabPanel={setActiveTabPanel}
    >
      <div className="tab-container">
        <div className="tab-list">
          {slots.tabPanel.map((tabPanel, i) => (
            <button
              key={tabPanel.nodeId}
              style={
                activeTabPanel === tabPanel.nodeId
                  ? { fontWeight: 700 }
                  : undefined
              }
              onClick={() => setActiveTabPanel(tabPanel.nodeId)}
            >
              {label[i]}
            </button>
          ))}
        </div>
        <div className="tab-panel">
          {slots.tabPanel
            .find((tabPanel) => tabPanel.nodeId === activeTabPanel)
            ?.element()}
        </div>
      </div>
    </OutputsProvider>
  );
}
