import { NodeSchema, t } from "@kragle/runtime";

export const TypographySchema = new NodeSchema(
  "@kragle/template-mui-material::Typography",
  {
    inputs: {
      text: {
        type: t.string(),
      },
      variant: {
        type: t.optional(
          t.union(
            t.string("h1"),
            t.string("h2"),
            t.string("h3"),
            t.string("h4"),
            t.string("h5"),
            t.string("h6"),
            t.string("subtitle1"),
            t.string("subtitle2"),
            t.string("body1"),
            t.string("body2"),
            t.string("caption"),
            t.string("button"),
            t.string("overline")
          )
        ),
      },
      noWrap: {
        type: t.optional(t.boolean()),
      },
      component: {
        type: t.optional(
          t.union(t.string("div"), t.string("span"), t.string("p"))
        ),
      },
    },
  }
);

export type TypographySchema = typeof TypographySchema;
