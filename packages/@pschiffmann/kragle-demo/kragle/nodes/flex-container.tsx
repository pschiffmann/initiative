import { FlexContainerProps } from "./flex-container.schema.js";

export function FlexContainer({ flexDirection, slots }: FlexContainerProps) {
  return (
    <div style={{ display: "flex", flexDirection }}>
      {slots.child.map((child) => child.element())}
    </div>
  );
}
