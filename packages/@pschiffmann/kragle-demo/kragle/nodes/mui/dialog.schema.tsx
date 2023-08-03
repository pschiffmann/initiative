import { NodeSchema, t } from "@kragle/runtime";

export const MuiDialogSchema = new NodeSchema(
  "@pschiffmann/kragle-demo::MuiDialog",
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
  },
);

export type MuiDialogSchema = typeof MuiDialogSchema;
