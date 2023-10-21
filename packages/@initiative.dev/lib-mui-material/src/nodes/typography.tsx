import { NodeComponentProps } from "@initiative.dev/schema";
import { Typography as MuiTypography } from "@mui/material";
import { TypographySchema } from "./typography.schema.js";

export function Typography({
  text,
  ...props
}: NodeComponentProps<TypographySchema>) {
  return <MuiTypography {...props}>{text}</MuiTypography>;
}
