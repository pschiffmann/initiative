import { NodeComponentProps } from "@initiative.dev/schema";
import { Typography } from "@mui/material";
import { MuiTypographySchema } from "./typography.schema.js";

export function MuiTypography({
  text,
  variant,
  ...props
}: NodeComponentProps<MuiTypographySchema>) {
  return (
    <Typography variant={variant} {...props}>
      {text}
    </Typography>
  );
}
