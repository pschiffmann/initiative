import { bemClasses } from "../index.js";

const cls = bemClasses("initiative-material-icon");

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
          ? `material-symbols-outlined ${className}`
          : `material-symbols-outlined`,
      )}
      title={title}
    >
      {icon}
    </span>
  );
}
