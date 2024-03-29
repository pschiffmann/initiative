import { NodeComponentProps } from "@initiative.dev/schema";
import { SwitchSchema } from "./switch.schema.js";

export function Switch({
  showIf,
  slots,
  ...props
}: NodeComponentProps<SwitchSchema>) {
  for (let i = 0; i < slots.case.size; i++) {
    if (showIf[i]) return <slots.case.Component index={i} {...props} />;
  }
  return null;
}
