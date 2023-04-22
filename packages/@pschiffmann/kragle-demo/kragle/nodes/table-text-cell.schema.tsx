import { InferProps, NodeSchema, t } from "@kragle/runtime";

export const TableTextCellSchema = new NodeSchema(
  "@pschiffmann/kragle-demo/TableTextCell",
  {
    inputs: {
      element: t.any(),
      getText: t.function(t.any())(t.string()),
    },
  }
);

export type TableTextCellProps = InferProps<typeof TableTextCellSchema>;
