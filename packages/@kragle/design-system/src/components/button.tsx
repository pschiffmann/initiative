import { bemClasses } from "../util/bem-classes.js";

const cls = bemClasses("kragle-button");

export interface ButtonProps {
  label: string;
  onPress?(): void;
  className?: string;
}

export function Button({ label, onPress, className }: ButtonProps) {
  return (
    <button className={cls.block(className)} onClick={onPress}>
      <span className={cls.element("label")}>{label}</span>
    </button>
  );
}
