import { InferProps, NodeSchema, t } from "@kragle/runtime";

export const DialogSchema = new NodeSchema("@pschiffmann/kragle-demo/Dialog", {
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
});

export type DialogProps = InferProps<typeof DialogSchema>;