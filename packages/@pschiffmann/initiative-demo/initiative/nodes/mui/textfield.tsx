import { NodeComponentProps } from "@initiative.dev/schema";
import { TextField } from "@mui/material";
import { MuiTextFieldSchema } from "./textfield.schema.js";

export function MuiTextField({
  label,
  value,
  onChange,
  ...props
}: NodeComponentProps<MuiTextFieldSchema>) {
  return (
    <TextField
      variant="filled"
      label={label}
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      {...props}
    />
  );
}
