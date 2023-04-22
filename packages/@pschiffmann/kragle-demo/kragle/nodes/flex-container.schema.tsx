import { InferProps, NodeSchema, t } from "@kragle/runtime";

export const FlexContainerSchema = new NodeSchema(
  "@pschiffmann/kragle-demo/FlexContainer",
  {
    inputs: {
      flexDirection: t.union(t.string("column"), t.string("row")),
    },
    slots: {
      child: {
        inputs: {},
      },
    },
  }
);

export type FlexContainerProps = InferProps<typeof FlexContainerSchema>;
