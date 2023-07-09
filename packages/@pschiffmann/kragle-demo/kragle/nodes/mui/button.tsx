import { NodeComponentProps } from "@kragle/runtime";
import { Button } from "@mui/material";
import { MuiButtonSchema } from "./button.schema.js";

export function MuiButton({
  label,
  variant,
  color,
  size,
  onPress,
}: NodeComponentProps<MuiButtonSchema>) {
  return (
    <Button variant={variant} color={color} size={size} onClick={onPress}>
      {label}
    </Button>
  );
}
