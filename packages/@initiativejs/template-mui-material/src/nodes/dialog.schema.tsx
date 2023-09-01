import { NodeSchema, t } from "@initiativejs/schema";

export const DialogSchema = new NodeSchema(
  "@initiativejs/template-mui-material::Dialog",
  {
    inputs: {
      title: {
        type: t.string(),
      },
    },
    outputs: {
      isOpen: {
        type: t.boolean(),
      },
      open: {
        type: t.function()()(),
      },
      close: {
        type: t.function()()(),
      },
      toggle: {
        type: t.function()()(),
      },
    },
    slots: {
      trigger: {},
      content: {},
    },
  },
);

export type DialogSchema = typeof DialogSchema;
