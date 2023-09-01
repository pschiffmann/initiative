import { NodeSchema, t } from "@initiativejs/schema";

export const MuiTableSchema = new NodeSchema(
  "@pschiffmann/initiative-demo::MuiTable",
  {
    inputs: {
      rows: {
        type: t.array(t.any()),
      },
      getRowKey: {
        type: t.function(t.any())()(t.string()),
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
