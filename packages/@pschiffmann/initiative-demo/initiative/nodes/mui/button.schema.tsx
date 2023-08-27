import { NodeSchema, t } from "@initiativejs/schema";

export const MuiButtonSchema = new NodeSchema(
  "@pschiffmann/initiative-demo::MuiButton",
  {
    inputs: {
      label: {
        type: t.string(),
      },
      variant: {
        type: t.optional(
          t.union(
            t.string("text"),
            t.string("outlined"),
            t.string("contained"),
          ),
        ),
      },
      color: {
        type: t.optional(
          t.union(
            t.string("primary"),
            t.string("secondary"),
            t.string("success"),
            t.string("error"),
            t.string("info"),
            t.string("warning"),
          ),
        ),
      },
      size: {
        type: t.optional(
          t.union(t.string("small"), t.string("medium"), t.string("large")),
        ),
      },
      onPress: {
        type: t.function()(),
      },
    },
    editor: {
      color: "#e69138",
    },
  },
);

export type MuiButtonSchema = typeof MuiButtonSchema;
