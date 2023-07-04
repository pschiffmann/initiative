import { bemClasses } from "@kragle/design-system";
import { ReactNode } from "react";

const cls = bemClasses("kragle-tool-frame");

export interface ToolFrameProps {
  title: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function ToolFrame({
  title,
  actions,
  className,
  children,
}: ToolFrameProps) {
  return (
    <div className={cls.block(className)}>
      <div className={cls.element("header")}>
        <div className={cls.element("title")}>{title}</div>
        {actions}
      </div>
      {children}
    </div>
  );
}
