import { bemClasses } from "../util/bem-classes.js";

const cls = bemClasses("initiative-button");

export interface ButtonProps {
  label: string;
  disabled?: boolean;
  onPress?(): void;
  className?: string;
}

export function Button({ label, disabled, onPress, className }: ButtonProps) {
  return (
    <button
      className={cls.block(className)}
      disabled={disabled}
      onClick={onPress}
    >
      <span className={cls.element("label")}>{label}</span>
    </button>
  );
}
