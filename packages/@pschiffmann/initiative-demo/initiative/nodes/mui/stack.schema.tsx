import { NodeSchema, t } from "@initiativejs/schema";

export const StackSchema = new NodeSchema(
  "@pschiffmann/initiative-demo::MuiStack",
  {
    inputs: {
      flexDirection: {
        type: t.union(t.string("column"), t.string("row")),
      },
      gap: {
        type: t.number(),
        optional: true,
      },
    },
    slots: {
      child: {
        inputs: {
          alignSelf: {
            type: t.union(
              t.string("start"),
              t.string("center"),
              t.string("end"),
              t.string("stretch"),
            ),
            optional: true,
          },
        },
      },
    },
    editor: {
      // color: "#008000",
      icon: "table_rows",
    },
  },
);

export type StackSchema = typeof StackSchema;
