import { bemClasses } from "../util/bem-classes.js";
import { MaterialIcon } from "./material-icon.js";

const cls = bemClasses("initiative-button");

export interface ButtonProps {
  label: string;
  startIcon?: string;
  endIcon?: string;
  disabled?: boolean;
  onPress?(): void;
  className?: string;
}

export function Button({
  label,
  startIcon,
  endIcon,
  disabled,
  onPress,
  className,
}: ButtonProps) {
  return (
    <button
      className={cls.block(className)}
      disabled={disabled}
      onClick={onPress}
    >
      {startIcon && (
        <MaterialIcon
          className={cls.element("icon", null, "start")}
          icon={startIcon}
        />
      )}
      <span className={cls.element("label")}>{label}</span>
      {endIcon && (
        <MaterialIcon
          className={cls.element("icon", null, "end")}
          icon={endIcon}
        />
      )}
    </button>
  );
}
