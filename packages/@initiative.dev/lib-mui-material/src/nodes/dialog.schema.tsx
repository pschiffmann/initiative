import { NodeSchema, t } from "@initiative.dev/schema";

export const DialogSchema = new NodeSchema(
  "@initiative.dev/lib-mui-material::Dialog",
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
