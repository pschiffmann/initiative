import { CommandStream, useAcceptCommands } from "@kragle/react-command";
import { ReactNode, useRef } from "react";
import { bemClasses } from "../index.js";

const cls = bemClasses("kragle-dialog");

export type DialogCommand = "open" | "close";

export interface DialogProps {
  commandStream?: CommandStream<DialogCommand>;
  className?: string;
  children: ReactNode;
}

export function Dialog({ commandStream, className, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  useAcceptCommands(commandStream, (command) => {
    switch (command) {
      case "open":
        ref.current!.showModal();
        break;
      case "close":
        ref.current!.close();
        break;
    }
    return true;
  });

  return (
    <dialog ref={ref} className={cls.block(className)}>
      {children}
    </dialog>
  );
}
