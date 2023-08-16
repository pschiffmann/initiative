import { NodeComponentProps } from "@initiativejs/schema";
import { DialogContent, DialogTitle, Dialog as MuiDialog } from "@mui/material";
import { useMemo, useState } from "react";
import { DialogSchema } from "./dialog.schema.js";

export function Dialog({
  title,
  slots,
  OutputsProvider,
}: NodeComponentProps<DialogSchema>) {
  const [isOpen, setIsOpen] = useState(false);
  const { open, close, toggle } = useMemo(
    () => ({
      open() {
        setIsOpen(true);
      },
      close() {
        setIsOpen(false);
      },
      toggle() {
        setIsOpen((prev) => !prev);
      },
    }),
    [],
  );

  return (
    <OutputsProvider isOpen={isOpen} open={open} close={close} toggle={toggle}>
      <slots.trigger.Component />
      <MuiDialog open={isOpen} onClose={close}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <slots.content.Component />
        </DialogContent>
      </MuiDialog>
    </OutputsProvider>
  );
}
