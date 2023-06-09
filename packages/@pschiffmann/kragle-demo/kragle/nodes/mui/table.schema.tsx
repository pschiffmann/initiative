import { t } from "@kragle/runtime";
import { InferProps, NodeSchema } from "@kragle/runtime/v2";

export const MuiTableSchema = new NodeSchema(
  "@pschiffmann/kragle-demo::MuiTable",
  {
    inputs: {
      rows: t.array(t.any()),
      getRowKey: t.function(t.any())(t.string()),
    },
    slots: {
      column: {
        inputs: {
          header: t.string(),
          align: t.optional(
            t.union(t.string("left"), t.string("center"), t.string("right"))
          ),
        },
        outputs: {
          row: t.any(),
        },
      },
    },
  }
);

export type MuiTableProps = InferProps<typeof MuiTableSchema>;
