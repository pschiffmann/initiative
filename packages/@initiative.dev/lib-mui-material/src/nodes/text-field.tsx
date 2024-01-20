import { NodeComponentProps } from "@initiative.dev/schema";
import { TextField as MuiTextField } from "@mui/material";
import { TextFieldSchema } from "./text-field.schema.js";

export function TextField({
  onChange,
  ...props
}: NodeComponentProps<TextFieldSchema>) {
  return (
    <MuiTextField
      variant="outlined"
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  );
}
