import { NodeSchema, t } from "@initiative.dev/schema";

export const TypographySchema = new NodeSchema(
  "@initiative.dev/lib-mui-material::Typography",
  {
    inputs: {
      text: {
        type: t.string(),
      },
      variant: {
        type: t.union(
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
          t.string("overline"),
        ),
        optional: true,
      },
      noWrap: {
        type: t.boolean(),
        optional: true,
      },
      color: {
        type: t.union(
          t.string("text.primary"),
          t.string("text.secondary"),
          t.string("text.disabled"),
          t.string("primary.light"),
          t.string("primary.main"),
          t.string("primary.dark"),
          t.string("secondary.light"),
          t.string("secondary.main"),
          t.string("secondary.dark"),
          t.string("success.light"),
          t.string("success.main"),
          t.string("success.dark"),
          t.string("warning.light"),
          t.string("warning.main"),
          t.string("warning.dark"),
          t.string("error.light"),
          t.string("error.main"),
          t.string("error.dark"),
          t.string("info.light"),
          t.string("info.main"),
          t.string("info.dark"),
        ),
        optional: true,
      },
      component: {
        type: t.union(t.string("div"), t.string("span"), t.string("p")),
        optional: true,
      },
    },
  },
);

export type TypographySchema = typeof TypographySchema;
