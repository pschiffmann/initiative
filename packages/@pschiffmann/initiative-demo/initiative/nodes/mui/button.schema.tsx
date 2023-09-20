import { NodeSchema, t } from "@initiativejs/schema";

export const MuiButtonSchema = new NodeSchema(
  "@pschiffmann/initiative-demo::MuiButton",
  {
    inputs: {
      label: {
        type: t.string(),
      },
      variant: {
        type: t.union(
          t.string("text"),
          t.string("outlined"),
          t.string("contained"),
        ),
        optional: true,
      },
      color: {
        type: t.union(
          t.string("primary"),
          t.string("secondary"),
          t.string("success"),
          t.string("error"),
          t.string("info"),
          t.string("warning"),
        ),
        optional: true,
      },
      size: {
        type: t.union(t.string("small"), t.string("medium"), t.string("large")),
        optional: true,
      },
      onPress: {
        type: t.function()()(),
      },
    },
    editor: {
      // color: "#00ffff",
      icon: "left_click",
    },
  },
);

export type MuiButtonSchema = typeof MuiButtonSchema;
