import { InferProps, NodeSchema, t } from "@kragle/runtime";

const sortDirection = t.union(t.string("asc"), t.string("desc"));

export const TableSchema = new NodeSchema("@pschiffmann/kragle-demo/Table", {
  inputs: {
    rows: t.array(t.any()),
    getRowKey: t.optional(t.function(t.any())(t.string())),
    pagination: t.optional(t.any()),
  },
  slots: {
    column: {
      inputs: {
        header: t.string(),
        sortDirection: t.optional(sortDirection),
        onSortDirectionChange: t.optional(t.function(sortDirection)()),
      },
      outputs: {
        row: t.any(),
      },
    },
  },
});

export type TableProps = InferProps<typeof TableSchema>;
