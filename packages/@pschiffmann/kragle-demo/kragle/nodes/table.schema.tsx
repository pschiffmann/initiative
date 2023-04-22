import { InferProps, NodeSchema, t } from "@kragle/runtime";

export const TableSchema = new NodeSchema("@pschiffmann/kragle-demo/Table", {
  inputs: {
    rows: t.array(t.any()),
    getRowKey: t.optional(t.function(t.any())(t.string())),
  },
  slots: {
    column: {
      inputs: {
        header: t.string(),
      },
      outputs: {
        row: t.any(),
      },
    },
  },
});

export type TableProps = InferProps<typeof TableSchema>;
