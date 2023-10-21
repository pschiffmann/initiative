import { NodeSchema, t } from "@initiative.dev/schema";

export const TextFieldSchema = new NodeSchema(
  "@initiative.dev/lib-mui-material::TextField",
  {
    inputs: {
      label: {
        type: t.string(),
      },
      value: {
        type: t.string(),
      },
      onChange: {
        type: t.function(t.string())()(),
      },
    },
  },
);

export type TextFieldSchema = typeof TextFieldSchema;
