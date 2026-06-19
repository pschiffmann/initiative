import { NodeComponentProps } from "@initiative.dev/schema";
import { MaterialIcon } from "../components/material-icon.js";
import { IconSchema } from "./icon.schema.js";

export function Icon({ icon, ...props }: NodeComponentProps<IconSchema>) {
  return <MaterialIcon icon={icon} {...props} />;
}
