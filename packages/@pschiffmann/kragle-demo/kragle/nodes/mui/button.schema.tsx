import { t } from "@kragle/runtime";
import { InferProps, NodeSchema } from "@kragle/runtime/v2";

export const MuiButtonSchema = new NodeSchema(
  "@pschiffmann/kragle-demo::MuiButton",
  {
    inputs: {
      label: t.string(),
      variant: t.optional(
        t.union(t.string("text"), t.string("outlined"), t.string("contained"))
      ),
      color: t.optional(
        t.union(
          t.string("primary"),
          t.string("secondary"),
          t.string("success"),
          t.string("error"),
          t.string("info"),
          t.string("warning")
        )
      ),
      size: t.optional(
        t.union(t.string("small"), t.string("medium"), t.string("large"))
      ),
      onPress: t.function()(),
    },
  }
);

export type MuiButtonProps = InferProps<typeof MuiButtonSchema>;
