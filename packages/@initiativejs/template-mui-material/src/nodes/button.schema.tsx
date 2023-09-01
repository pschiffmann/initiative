import { NodeSchema, t } from "@initiativejs/schema";

export const ButtonSchema = new NodeSchema(
  "@initiativejs/template-mui-material::Button",
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
            t.string("contained-elevated"),
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
      startIcon: {
        type: t.optional(t.string()),
      },
      endIcon: {
        type: t.optional(t.string()),
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

export type ButtonSchema = typeof ButtonSchema;
