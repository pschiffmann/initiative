import { NodeComponentProps } from "@initiative.dev/schema";
import { Divider as MuiDivider } from "@mui/material";
import { DividerSchema } from "./divider.schema.js";

export function Divider(props: NodeComponentProps<DividerSchema>) {
  return <MuiDivider {...props} />;
}
