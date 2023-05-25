import { bemClasses } from "../util/bem-classes.js";

const cls = bemClasses("kragle-button");

export interface ButtonProps {
  label: string;
  onPress?(): void;
}

export function Button({ label, onPress }: ButtonProps) {
  return (
    <button className={cls.block()} onClick={onPress}>
      <span className={cls.element("label")}>{label}</span>
    </button>
  );
}
