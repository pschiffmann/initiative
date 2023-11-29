import { NodeComponentProps } from "@initiative.dev/schema";
import { TextField as MuiTextField } from "@mui/material";
import { ReadonlyTextAreaSchema } from "./readonly-text-area.schema.js";

export function ReadonlyTextArea({
  label,
  value,
}: NodeComponentProps<ReadonlyTextAreaSchema>) {
  return (
    <MuiTextField
      sx={{ width: 1, height: 1 }}
      variant="outlined"
      multiline
      label={label}
      value={value}
    />
  );
}
