import { CommandStream, useAcceptCommands } from "@initiativejs/react-command";
import { ReactNode, useRef, useState } from "react";
import { bemClasses } from "../index.js";

const cls = bemClasses("initiative-dialog");

export type DialogCommand = "open" | "close";

export interface DialogProps {
  commandStream: CommandStream<DialogCommand>;
  className?: string;
  children: ReactNode;
}

export function Dialog({ commandStream, className, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useAcceptCommands(commandStream, (command) => {
    switch (command) {
      case "open":
        ref.current!.showModal();
        setOpen(true);
        break;
      case "close":
        ref.current!.close();
        break;
    }
    return true;
  });

  return (
    <dialog
      ref={ref}
      className={cls.block(className)}
      onClose={() => setOpen(false)}
    >
      {open && children}
    </dialog>
  );
}
