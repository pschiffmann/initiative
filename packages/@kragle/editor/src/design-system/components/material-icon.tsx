import { bemClasses } from "../index.js";

const cls = bemClasses("kragle-material-icon");

export interface MaterialIconProps {
  icon: string;
  title?: string;
  className?: string;
}

export function MaterialIcon({ icon, title, className }: MaterialIconProps) {
  return (
    <span
      className={cls.block(
        className
          ? `material-icons-outlined ${className}`
          : `material-icons-outlined`,
      )}
      title={title}
    >
      {icon}
    </span>
  );
}
