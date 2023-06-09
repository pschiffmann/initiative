import { t } from "@kragle/runtime";
import { InferProps, NodeSchema } from "@kragle/runtime/v2";

export const MuiTextFieldSchema = new NodeSchema(
  "@pschiffmann/kragle-demo::MuiTextField",
  {
    inputs: {
      label: t.string(),
      value: t.string(),
      onChange: t.function(t.string())(),
    },
  }
);

export type MuiTextFieldProps = InferProps<typeof MuiTextFieldSchema>;
