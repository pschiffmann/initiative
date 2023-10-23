import { NodeComponentProps } from "@initiative.dev/schema";
import { Avatar as MuiAvatar } from "@mui/material";
import { AvatarSchema } from "./avatar.schema.js";

export function Avatar({
  size = 0,
  ...props
}: NodeComponentProps<AvatarSchema>) {
  return (
    <MuiAvatar
      sx={{ width: 40 + size * 8, height: 40 + size * 8 }}
      {...props}
    />
  );
}
