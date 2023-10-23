import { NodeComponentProps } from "@initiative.dev/schema";
import { MaterialIcon } from "../components/material-icon.js";
import { IconSchema } from "./icon.schema.js";

export function Icon({ icon }: NodeComponentProps<IconSchema>) {
  return <MaterialIcon icon={icon} />;
}
