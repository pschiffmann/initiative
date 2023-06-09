import { t } from "@kragle/runtime";
import { InferProps, NodeSchema } from "@kragle/runtime/v2";

export const MuiTypographySchema = new NodeSchema(
  "@pschiffmann/kragle-demo::MuiTypography",
  {
    inputs: {
      text: t.string(),
      variant: t.optional(
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
  }
);

export type MuiTypographyProps = InferProps<typeof MuiTypographySchema>;
