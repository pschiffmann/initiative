import { InferProps, NodeSchema, t } from "@kragle/runtime";

export const MuiTableSchema = new NodeSchema(
  "@pschiffmann/kragle-demo/MuiTable",
  {
    inputs: {
      rows: t.array(t.any()),
      getRowKey: t.function(t.any())(t.string()),
      header1: t.string(),
      header2: t.string(),
      header3: t.string(),
      header4: t.string(),
      align1: t.optional(
        t.union(t.string("left"), t.string("center"), t.string("right"))
      ),
      align2: t.optional(
        t.union(t.string("left"), t.string("center"), t.string("right"))
      ),
      align3: t.optional(
        t.union(t.string("left"), t.string("center"), t.string("right"))
      ),
      align4: t.optional(
        t.union(t.string("left"), t.string("center"), t.string("right"))
      ),
    },
    slots: {
      column1: {
        outputs: {
          row: t.any(),
        },
      },
      column2: {
        outputs: {
          row: t.any(),
        },
      },
      column3: {
        outputs: {
          row: t.any(),
        },
      },
      column4: {
        outputs: {
          row: t.any(),
        },
      },
    },
  }
);

export type MuiTableProps = InferProps<typeof MuiTableSchema>;
