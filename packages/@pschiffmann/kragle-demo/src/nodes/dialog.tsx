import { InferProps, NodeSpec, t } from "@kragle/runtime";
import { useMemo, useRef, useState } from "react";

export const spec = new NodeSpec("@pschiffmann/kragle-demo/Dialog", {
  outputs: {
    isOpen: t.boolean,
    open: t.function()(),
    close: t.function()(),
    toggle: t.function()(),
  },
  slots: {
    Trigger: {},
    Content: {},
  },
});

export const component = function Dialog({
  OutputsProvider,
}: InferProps<typeof spec>) {
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
          <dialog ref={dialogRef}>
            <Content />
          </dialog>
        </>
      )}
    </OutputsProvider>
  );
};
