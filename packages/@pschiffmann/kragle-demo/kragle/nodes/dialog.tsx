import { useMemo, useRef, useState } from "react";
import { DialogProps } from "./dialog.schema.js";

export function Dialog({ slots, OutputsProvider }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const { open, close, toggle } = useMemo(
    () => ({
      open() {
        if (dialogRef.current!.open) return;
        dialogRef.current!.showModal();
        setIsOpen(true);
      },
      close() {
        if (!dialogRef.current!.open) return;
        dialogRef.current!.close();
        setIsOpen(false);
      },
      toggle() {
        if (dialogRef.current!.open) {
          dialogRef.current!.close();
          setIsOpen(false);
        } else {
          dialogRef.current!.showModal();
          setIsOpen(true);
        }
      },
    }),
    []
  );

  return (
    <OutputsProvider isOpen={isOpen} open={open} close={close} toggle={toggle}>
      {slots.trigger.element()}
      <dialog ref={dialogRef}>{isOpen && slots.content.element()}</dialog>
    </OutputsProvider>
  );
}
