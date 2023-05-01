import { InferProps, NodeSchema, t } from "@kragle/runtime";

export const FlexContainerSchema = new NodeSchema(
  "@pschiffmann/kragle-demo/FlexContainer",
  {
    inputs: {
      flexDirection: t.union(t.string("column"), t.string("row")),
      gap: t.optional(t.number()),
    },
    slots: {
      child: {
        inputs: {
          alignSelf: t.optional(
            t.union(
              t.string("start"),
              t.string("center"),
              t.string("end"),
              t.string("stretch")
            )
          ),
        },
      },
    },
  }
);

export type FlexContainerProps = InferProps<typeof FlexContainerSchema>;
