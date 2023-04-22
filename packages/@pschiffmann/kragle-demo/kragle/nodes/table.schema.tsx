import { InferProps, NodeSchema, t } from "@kragle/runtime";

export const TableSchema = new NodeSchema("@pschiffmann/kragle-demo/Table", {
  inputs: {
    elements: t.array(t.any()),
    getElementKey: t.optional(
      t.function(t.any())(t.union(t.string(), t.number()))
    ),
  },
  slots: {
    Column: {
      inputs: {
        header: t.string(),
      },
      outputs: {
        element: t.any(),
      },
    },
  },
});

export type TableProps = InferProps<typeof TableSchema>;
