import { t } from "@kragle/runtime";
import { InferProps, NodeSchema } from "@kragle/runtime/v2";

export const MuiDialogSchema = new NodeSchema(
  "@pschiffmann/kragle-demo::MuiDialog",
  {
    inputs: {
      title: t.string(),
    },
    outputs: {
      isOpen: t.boolean(),
      open: t.function()(),
      close: t.function()(),
      toggle: t.function()(),
    },
    slots: {
      trigger: {},
      content: {},
    },
  }
);

export type MuiDialogProps = InferProps<typeof MuiDialogSchema>;
