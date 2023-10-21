import { NodeSchema, t } from "@initiative.dev/schema";

export const IconButtonSchema = new NodeSchema(
  "@initiative.dev/lib-mui-material::IconButton",
  {
    inputs: {
      label: {
        type: t.string(),
      },
      icon: {
        type: t.string(),
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
        optional: true,
      },
      disabled: {
        type: t.boolean(),
        optional: true,
      },
    },
  },
);

export type IconButtonSchema = typeof IconButtonSchema;
