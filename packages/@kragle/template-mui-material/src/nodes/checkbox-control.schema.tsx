import { NodeSchema, t } from "@kragle/runtime";

export const CheckboxControlSchema = new NodeSchema(
  "@kragle/template-mui-material::CheckboxControl",
  {
    inputs: {
      label: {
        type: t.string(),
      },
      checked: {
        type: t.boolean(),
      },
      onChange: {
        type: t.function(t.boolean())(),
      },
    },
  }
);

export type CheckboxControlSchema = typeof CheckboxControlSchema;
