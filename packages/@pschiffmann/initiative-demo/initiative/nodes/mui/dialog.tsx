import { NodeComponentProps } from "@initiative.dev/schema";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { useMemo, useState } from "react";
import { MuiDialogSchema } from "./dialog.schema.js";

export function MuiDialog({
  title,
  slots,
  OutputsProvider,
  ...props
}: NodeComponentProps<MuiDialogSchema>) {
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
    <OutputsProvider
      isOpen={isOpen}
      open={open}
      close={close}
      toggle={toggle}
      {...props}
    >
      <slots.trigger.Component />
      <Dialog open={isOpen} onClose={close}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <slots.content.Component />
        </DialogContent>
      </Dialog>
    </OutputsProvider>
  );
}
