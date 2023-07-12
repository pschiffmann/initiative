import { NodeComponentProps } from "@kragle/runtime";
import { RepeatSchema } from "./repeat.schema.js";

export function Repeat({
  collection,
  slots,
  OutputsProvider,
}: NodeComponentProps<RepeatSchema>) {
  return (
    <OutputsProvider isEmpty={collection.length === 0}>
      {collection.map((item, index) => (
        <slots.child.Component key={index} index={index} item={item} />
      ))}
    </OutputsProvider>
  );
}
