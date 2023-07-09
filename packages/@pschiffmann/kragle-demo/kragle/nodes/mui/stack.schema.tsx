import { NodeSchema, t } from "@kragle/runtime";

export const StackSchema = new NodeSchema(
  "@pschiffmann/kragle-demo::MuiStack",
  {
    inputs: {
      flexDirection: {
        type: t.union(t.string("column"), t.string("row")),
      },
      gap: {
        type: t.optional(t.number()),
      },
    },
    slots: {
      child: {
        inputs: {
          alignSelf: {
            type: t.optional(
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
    },
  }
);

export type StackSchema = typeof StackSchema;
