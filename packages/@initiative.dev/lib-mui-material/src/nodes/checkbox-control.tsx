import { NodeComponentProps } from "@initiative.dev/schema";
import { Checkbox, FormControlLabel } from "@mui/material";
import { CheckboxControlSchema } from "./checkbox-control.schema.js";

export function CheckboxControl({
  label,
  checked,
  onChange,
}: NodeComponentProps<CheckboxControlSchema>) {
  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={checked}
          onChange={(e, checked) => onChange(checked)}
        />
      }
      label={label}
    />
  );
}
