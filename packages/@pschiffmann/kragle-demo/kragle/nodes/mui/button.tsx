import { Button } from "@mui/material";
import { MuiButtonProps } from "./button.schema.js";

export function MuiButton({
  label,
  variant,
  color,
  size,
  onPress,
}: MuiButtonProps) {
  return (
    <Button variant={variant} color={color} size={size} onClick={onPress}>
      {label}
    </Button>
  );
}
