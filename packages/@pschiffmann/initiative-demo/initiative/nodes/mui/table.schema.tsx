import { NodeSchema, t } from "@initiativejs/schema";
import { articleType } from "../../libraries/article.schema.js";

export const MuiTableSchema = new NodeSchema(
  "@pschiffmann/initiative-demo::MuiTable",
  {
    inputs: {
      rows: {
        type: t.array(articleType()),
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
            type: articleType(),
          },
        },
      },
    },
  },
);

export type MuiTableSchema = typeof MuiTableSchema;
