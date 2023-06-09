import { t } from "@kragle/runtime";
import { InferProps, NodeSchema } from "@kragle/runtime/v2";

export const StackSchema = new NodeSchema(
  "@pschiffmann/kragle-demo::MuiStack",
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

export type StackProps = InferProps<typeof StackSchema>;
