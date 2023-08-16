import { NodeSchema, t } from "@initiativejs/schema";

export const MuiTextFieldSchema = new NodeSchema(
  "@pschiffmann/initiative-demo::MuiTextField",
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
