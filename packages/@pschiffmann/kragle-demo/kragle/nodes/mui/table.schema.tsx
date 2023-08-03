import { NodeSchema, t } from "@kragle/runtime";

export const MuiTableSchema = new NodeSchema(
  "@pschiffmann/kragle-demo::MuiTable",
  {
    inputs: {
      rows: {
        type: t.array(t.any()),
      },
      getRowKey: {
        type: t.function(t.any())(t.string()),
      },
    },
    slots: {
      column: {
        inputs: {
          header: {
            type: t.string(),
          },
          align: {
            type: t.optional(
              t.union(t.string("left"), t.string("center"), t.string("right")),
            ),
          },
        },
        outputs: {
          row: {
            type: t.any(),
          },
        },
      },
    },
  },
);

export type MuiTableSchema = typeof MuiTableSchema;
