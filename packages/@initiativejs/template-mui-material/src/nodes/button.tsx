import { NodeComponentProps } from "@initiativejs/schema";
import { Button as MuiButton } from "@mui/material";
import { MaterialIcon } from "../components/material-icon.js";
import { ButtonSchema } from "./button.schema.js";

export function Button({
  label,
  variant,
  color,
  onPress,
  startIcon,
  endIcon,
  ...props
}: NodeComponentProps<ButtonSchema>) {
  return (
    <MuiButton
      variant={variant === "contained-elevated" ? "contained" : variant}
      disableElevation={variant === "contained"}
      color={color ?? "inherit"}
      startIcon={startIcon && <MaterialIcon icon={startIcon} />}
      endIcon={endIcon && <MaterialIcon icon={endIcon} />}
      onClick={onPress}
      {...props}
    >
      {label}
    </MuiButton>
  );
}
