import { NodeSchema, t } from "@initiative.dev/schema";

export const MuiDialogSchema = new NodeSchema(
  "@pschiffmann/initiative-demo::MuiDialog",
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
    editor: {
      // color: "#008000",
      icon: "web_asset",
    },
  },
);

export type MuiDialogSchema = typeof MuiDialogSchema;
