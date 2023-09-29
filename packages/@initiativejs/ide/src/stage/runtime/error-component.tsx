import { NodeData } from "#shared";
import { CSSProperties } from "react";

export const rootStyle: CSSProperties = {
  padding: 8,
  backgroundColor: "darkred",
  color: "white",
  fontFamily: "monospace",
};

const listStyle = {
  margin: 0,
  padding: "4px 16px",
};

export interface ErrorComponentProps {
  nodeData: NodeData;
}

export function ErrorComponent({ nodeData }: ErrorComponentProps) {
  const errors = nodeData.errors!;
  return (
    <div style={rootStyle}>
      <b>Error in node '{nodeData.id}':</b>
      <ul style={listStyle}>
        {[...errors.invalidInputs].map((inputKey) => (
          <li key={inputKey}>Input '{inputKey}' has invalid value.</li>
        ))}
        {[...errors.missingSlots].map((slotName) => (
          <li key={slotName}>Slot '{slotName}' is required.</li>
        ))}
      </ul>
    </div>
  );
}
