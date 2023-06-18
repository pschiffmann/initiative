import { CommandStream } from "@kragle/react-command";
import { ReactNode, useEffect, useRef } from "react";
import { bemClasses } from "../index.js";

const cls = bemClasses("kragle-dialog");

export interface DialogProps {
  setOpenCommandStream?: CommandStream<boolean>;
  className?: string;
  children: ReactNode;
}

export function Dialog({
  setOpenCommandStream,
  className,
  children,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(
    () =>
      setOpenCommandStream?.listen((open: boolean) => {
        if (open) {
          ref.current!.showModal();
        } else {
          ref.current!.close();
        }
        return true;
      }),
    [setOpenCommandStream]
  );

  return (
    <dialog ref={ref} className={cls.block(className)}>
      {children}
    </dialog>
  );
}
