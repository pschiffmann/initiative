import { FlexContainerProps } from "./flex-container.schema.js";

export function FlexContainer({
  flexDirection,
  gap,
  alignSelf,
  slots,
}: FlexContainerProps) {
  return (
    <div style={{ display: "flex", flexDirection, gap }}>
      {slots.child.map((child, i) => (
        <div key={child.nodeId} style={{ alignSelf: alignSelf[i] }}>
          {child.element()}
        </div>
      ))}
    </div>
  );
}
