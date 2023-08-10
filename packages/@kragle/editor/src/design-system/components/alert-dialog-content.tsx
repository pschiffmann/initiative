import { ReactNode } from "react";
import { bemClasses } from "../index.js";

const cls = bemClasses("kragle-alert-dialog-content");

export interface AlertDialogContentProps {
  title: string;
  actions: ReactNode;
  className?: string;
  children: ReactNode;
}

export function AlertDialogContent({
  title,
  actions,
  className,
  children,
}: AlertDialogContentProps) {
  return (
    <div className={cls.block(className)}>
      <div className={cls.element("title")}>{title}</div>
      <div className={cls.element("body")}>{children}</div>
      <div className={cls.element("actions")}>{actions}</div>
    </div>
  );
}
