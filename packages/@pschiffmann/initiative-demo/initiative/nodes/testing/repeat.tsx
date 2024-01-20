import { NodeComponentProps } from "@initiative.dev/schema";
import { RepeatSchema } from "./repeat.schema.js";

export function Repeat({
  collection,
  slots,
  OutputsProvider,
}: NodeComponentProps<RepeatSchema>) {
  throw new Error(
    "This component violates the Initiative rule that each node may only " +
      "render a single DOM node.",
  );
  return (
    <OutputsProvider isEmpty={collection.length === 0}>
      {collection.map((item, index) => (
        <slots.child.Component key={index} index={index} item={item} />
      ))}
    </OutputsProvider>
  );
}
