import { InferProps, NodeSchema, t } from "@kragle/runtime";

export const TableButtonCellSchema = new NodeSchema(
  "@pschiffmann/kragle-demo/TableButtonCell",
  {
    inputs: {
      label: t.string(),
      onPress: t.function()(),
    },
  }
);

export type TableButtonCellProps = InferProps<typeof TableButtonCellSchema>;
