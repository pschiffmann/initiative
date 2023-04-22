import { useMemo, useRef, useState } from "react";
import { DialogProps } from "./dialog.schema.js";

export function Dialog({ OutputsProvider }: DialogProps) {
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
      {({ Trigger, Content }) => (
        <>
          <Trigger />
          <dialog ref={dialogRef}>{isOpen && <Content />}</dialog>
        </>
      )}
    </OutputsProvider>
  );
}
