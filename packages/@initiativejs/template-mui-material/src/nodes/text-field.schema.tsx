import { NodeSchema, t } from "@initiativejs/schema";

export const TextFieldSchema = new NodeSchema(
  "@initiativejs/template-mui-material::TextField",
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

export type TextFieldSchema = typeof TextFieldSchema;
