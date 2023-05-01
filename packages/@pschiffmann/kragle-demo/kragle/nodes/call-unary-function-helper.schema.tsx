import { InferProps, NodeSchema, t } from "@kragle/runtime";

export const CallUnaryFunctionHelperSchema = new NodeSchema(
  "@pschiffmann/kragle-demo/CallUnaryFunctionHelper",
  {
    inputs: {
      function: t.function(t.any())(t.any()),
      argument: t.any(),
    },
    outputs: {
      result: t.any(),
    },
    slots: {
      child: {},
    },
  }
);

export type CallUnaryFunctionHelperProps = InferProps<
  typeof CallUnaryFunctionHelperSchema
>;
