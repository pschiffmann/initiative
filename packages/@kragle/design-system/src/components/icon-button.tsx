import { bemClasses } from "../util/bem-classes.js";
import { MaterialIcon } from "./material-icon.js";

const cls = bemClasses("kragle-icon-button");

export interface IconButtonProps {
  label: string;
  icon: string;
  onPress?(): void;
  className?: string;
}

export function IconButton({
  label,
  icon,
  onPress,
  className,
}: IconButtonProps) {
  return (
    <button className={cls.block(className)} title={label} onClick={onPress}>
      <MaterialIcon className={cls.element("icon")} icon={icon} />
    </button>
  );
}
