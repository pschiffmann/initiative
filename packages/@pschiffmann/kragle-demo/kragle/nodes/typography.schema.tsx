import { InferProps, NodeSchema, t } from "@kragle/runtime";

export const TypographySchema = new NodeSchema(
  "@pschiffmann/kragle-demo/Typography",
  {
    inputs: {
      text: t.string(),
      variant: t.optional(
        t.union(t.string("h1"), t.string("h2"), t.string("h3"), t.string("p"))
      ),
    },
  }
);

export type TypographyProps = InferProps<typeof TypographySchema>;
