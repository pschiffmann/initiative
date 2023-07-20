import { NodeSchema, t } from "@kragle/runtime";

export const DialogSchema = new NodeSchema(
  "@kragle/template-mui-material::Dialog",
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
        type: t.function()(),
      },
      close: {
        type: t.function()(),
      },
      toggle: {
        type: t.function()(),
      },
    },
    slots: {
      trigger: {},
      content: {},
    },
  }
);

export type DialogSchema = typeof DialogSchema;
