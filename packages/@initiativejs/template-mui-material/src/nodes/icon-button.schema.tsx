import { NodeSchema, t } from "@initiativejs/schema";

export const IconButtonSchema = new NodeSchema(
  "@initiativejs/template-mui-material::IconButton",
  {
    inputs: {
      label: {
        type: t.string(),
      },
      icon: {
        type: t.string(),
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
        type: t.optional(t.function()()()),
      },
      disabled: {
        type: t.optional(t.boolean()),
      },
    },
  },
);

export type IconButtonSchema = typeof IconButtonSchema;
