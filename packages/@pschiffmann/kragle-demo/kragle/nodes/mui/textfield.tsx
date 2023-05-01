import { TextField } from "@mui/material";
import { MuiTextFieldProps } from "./textfield.schema.js";

export function MuiTextField({ label, value, onChange }: MuiTextFieldProps) {
  return (
    <TextField
      variant="filled"
      label={label}
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
    />
  );
}
