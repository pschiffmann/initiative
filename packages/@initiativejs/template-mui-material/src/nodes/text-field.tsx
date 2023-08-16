import { NodeComponentProps } from "@initiativejs/schema";
import { TextField as MuiTextField } from "@mui/material";
import { TextFieldSchema } from "./text-field.schema.js";

export function TextField({
  label,
  value,
  onChange,
}: NodeComponentProps<TextFieldSchema>) {
  return (
    <MuiTextField
      variant="outlined"
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
