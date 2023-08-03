import { NodeSchema, t } from "@kragle/runtime";

export const MuiTextFieldSchema = new NodeSchema(
  "@pschiffmann/kragle-demo::MuiTextField",
  {
    inputs: {
      label: {
        type: t.string(),
      },
      value: {
        type: t.string(),
      },
      onChange: {
        type: t.function(t.string())(),
      },
    },
  },
);

export type MuiTextFieldSchema = typeof MuiTextFieldSchema;
