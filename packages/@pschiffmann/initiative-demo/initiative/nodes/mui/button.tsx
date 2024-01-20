import { NodeComponentProps } from "@initiative.dev/schema";
import { Button } from "@mui/material";
import { MuiButtonSchema } from "./button.schema.js";

export function MuiButton({
  label,
  variant,
  color,
  size,
  onPress,
  ...props
}: NodeComponentProps<MuiButtonSchema>) {
  return (
    <Button
      variant={variant}
      color={color}
      size={size}
      onClick={onPress}
      {...props}
    >
      {label}
    </Button>
  );
}
