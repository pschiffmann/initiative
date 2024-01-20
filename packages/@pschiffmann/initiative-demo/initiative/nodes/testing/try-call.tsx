import { NodeComponentProps } from "@initiative.dev/schema";
import { TryCallSchema } from "./try-call.schema.js";

export function TryCall({
  callable,
  slots,
  ...props
}: NodeComponentProps<TryCallSchema>) {
  try {
    return <slots.onSuccess.Component value={callable()} {...props} />;
  } catch (e) {
    return <slots.onError.Component error={`${e}`} {...props} />;
  }
}
