import { NodeSchema, t } from "@initiativejs/schema";

export const CheckboxControlSchema = new NodeSchema(
  "@initiativejs/template-mui-material::CheckboxControl",
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
  },
);

export type CheckboxControlSchema = typeof CheckboxControlSchema;
