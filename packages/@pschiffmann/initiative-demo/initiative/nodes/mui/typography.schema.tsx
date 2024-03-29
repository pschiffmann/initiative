import { NodeSchema, t } from "@initiative.dev/schema";

export const MuiTypographySchema = new NodeSchema(
  "@pschiffmann/initiative-demo::MuiTypography",
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
    },
    editor: {
      // color: "#191970",
      icon: "text_fields",
    },
  },
);

export type MuiTypographySchema = typeof MuiTypographySchema;
