import { ButtonProps } from "./button-schema.js";

export function Button({ label, onPress }: ButtonProps) {
  return <button onClick={onPress}>{label}</button>;
}
