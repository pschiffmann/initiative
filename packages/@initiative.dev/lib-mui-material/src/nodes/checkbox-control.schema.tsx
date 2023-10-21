import { NodeSchema, t } from "@initiative.dev/schema";

export const CheckboxControlSchema = new NodeSchema(
  "@initiative.dev/lib-mui-material::CheckboxControl",
  {
    inputs: {
      label: {
        type: t.string(),
      },
      checked: {
        type: t.boolean(),
      },
      onChange: {
        type: t.function(t.boolean())()(),
      },
    },
  },
);

export type CheckboxControlSchema = typeof CheckboxControlSchema;
