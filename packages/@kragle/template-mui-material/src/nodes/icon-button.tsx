import { NodeComponentProps } from "@kragle/runtime";
import { IconButton as MuiIconButton } from "@mui/material";
import { MaterialIcon } from "../components/material-icon.js";
import { IconButtonSchema } from "./icon-button.schema.js";

export function IconButton({
  label,
  icon,
  color,
  onPress,
  ...props
}: NodeComponentProps<IconButtonSchema>) {
  return (
    <MuiIconButton
      aria-label={label}
      color={color ?? "inherit"}
      onClick={onPress}
      {...props}
    >
      <MaterialIcon icon={icon} />
    </MuiIconButton>
  );
}
