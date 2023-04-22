import { InferProps, NodeSchema, t } from "@kragle/runtime";

export const BlocSchema = new NodeSchema("@pschiffmann/kragle-demo/Bloc", {
  outputs: {
    label: t.string(),
    increaseCounter: t.function()(),
  },
  slots: {
    child: {},
  },
});

export type BlocProps = InferProps<typeof BlocSchema>;
