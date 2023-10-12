import { NodeSchema, t } from "@initiativejs/schema";
import { article } from "../../types.js";

export const MuiTableSchema = new NodeSchema(
  "@pschiffmann/initiative-demo::MuiTable",
  {
    inputs: {
      rows: {
        type: t.array(article()),
      },
    },
    slots: {
      column: {
        inputs: {
          header: {
            type: t.string(),
          },
          align: {
            type: t.union(
              t.string("left"),
              t.string("center"),
              t.string("right"),
            ),
            optional: true,
          },
        },
        outputs: {
          row: {
            type: article(),
          },
        },
      },
    },
    editor: {
      // color: "#191970",
      icon: "table",
    },
  },
);

export type MuiTableSchema = typeof MuiTableSchema;
