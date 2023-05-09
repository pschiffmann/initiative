import { FlexContainerProps } from "./flex-container.schema.js";

export function FlexContainer({
  flexDirection,
  gap,
  alignSelf1,
  alignSelf2,
  alignSelf3,
  slots,
}: FlexContainerProps) {
  return (
    <div style={{ display: "flex", flexDirection, gap }}>
      <div style={{ alignSelf: alignSelf1 }}>{slots.child1.element()}</div>
      <div style={{ alignSelf: alignSelf2 }}>{slots.child2.element()}</div>
      <div style={{ alignSelf: alignSelf3 }}>{slots.child3.element()}</div>
    </div>
  );
}
