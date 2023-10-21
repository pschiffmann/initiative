import { NodeSchema, t } from "@initiative.dev/schema";

export const ButtonSchema = new NodeSchema(
  "@initiative.dev/lib-mui-material::Button",
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
          t.string("contained-elevated"),
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
      startIcon: {
        type: t.string(),
        optional: true,
      },
      endIcon: {
        type: t.string(),
        optional: true,
      },
      onPress: {
        type: t.function()()(),
        optional: true,
      },
      disabled: {
        type: t.boolean(),
        optional: true,
      },
    },
  },
);

export type ButtonSchema = typeof ButtonSchema;
