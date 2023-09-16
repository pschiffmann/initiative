import { bemClasses } from "../util/bem-classes.js";
import { MaterialIcon } from "./material-icon.js";

const cls = bemClasses("initiative-icon-button");

export interface IconButtonProps {
  label: string;
  icon: string;
  disabled?: boolean;
  onPress?(): void;
  className?: string;
  id?: string;
}

export function IconButton({
  label,
  icon,
  disabled,
  onPress,
  className,
  id,
}: IconButtonProps) {
  return (
    <button
      className={cls.block(className)}
      id={id}
      title={label}
      disabled={disabled}
      onClick={onPress}
    >
      <MaterialIcon className={cls.element("icon")} icon={icon} />
    </button>
  );
}
