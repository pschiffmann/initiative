import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { useMemo, useState } from "react";
import { MuiDialogProps } from "./dialog.schema.js";

export function MuiDialog({ title, slots, OutputsProvider }: MuiDialogProps) {
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
    []
  );

  return (
    <OutputsProvider isOpen={isOpen} open={open} close={close} toggle={toggle}>
      {slots.trigger.element()}
      <Dialog open={isOpen} onClose={close}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>{slots.content.element()}</DialogContent>
      </Dialog>
    </OutputsProvider>
  );
}
