import { NodeComponentProps } from "@kragle/runtime";
import { TryCallSchema } from "./try-call.schema.js";

export function TryCall({
  callable,
  slots,
}: NodeComponentProps<TryCallSchema>) {
  try {
    return <slots.onSuccess.Component value={callable()} />;
  } catch (e) {
    return <slots.onError.Component error={`${e}`} />;
  }
}
