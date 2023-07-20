import { NodeSchema, t } from "@kragle/runtime";

export const TextFieldSchema = new NodeSchema(
  "@kragle/template-mui-material::TextField",
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
  }
);

export type TextFieldSchema = typeof TextFieldSchema;
