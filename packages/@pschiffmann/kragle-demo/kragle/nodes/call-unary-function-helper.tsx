import { CallUnaryFunctionHelperProps } from "./call-unary-function-helper.schema.js";

export function CallUnaryFunctionHelper({
  function: fn,
  argument,
  slots,
  OutputsProvider,
}: CallUnaryFunctionHelperProps) {
  return (
    <OutputsProvider result={fn(argument)}>
      {slots.child.element()}
    </OutputsProvider>
  );
}
