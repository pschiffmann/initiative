import { Typography } from "@mui/material";
import { MuiTypographyProps } from "./typography.schema.js";

export function MuiTypography({ text, variant }: MuiTypographyProps) {
  return <Typography variant={variant}>{text}</Typography>;
}
