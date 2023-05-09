import { InferProps, NodeSchema, t } from "@kragle/runtime";

export const FlexContainerSchema = new NodeSchema(
  "@pschiffmann/kragle-demo/FlexContainer",
  {
    inputs: {
      flexDirection: t.union(t.string("column"), t.string("row")),
      gap: t.optional(t.number()),
      alignSelf1: t.optional(
        t.union(
          t.string("start"),
          t.string("center"),
          t.string("end"),
          t.string("stretch")
        )
      ),
      alignSelf2: t.optional(
        t.union(
          t.string("start"),
          t.string("center"),
          t.string("end"),
          t.string("stretch")
        )
      ),
      alignSelf3: t.optional(
        t.union(
          t.string("start"),
          t.string("center"),
          t.string("end"),
          t.string("stretch")
        )
      ),
    },
    slots: {
      child1: {},
      child2: {},
      child3: {},
    },
  }
);

export type FlexContainerProps = InferProps<typeof FlexContainerSchema>;
