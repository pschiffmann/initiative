import { NodeComponentProps } from "@initiativejs/schema";
import { Typography } from "@mui/material";
import { MuiTypographySchema } from "./typography.schema.js";

export function MuiTypography({
  text,
  variant,
}: NodeComponentProps<MuiTypographySchema>) {
  return <Typography variant={variant}>{text}</Typography>;
}