import { NodeComponentProps } from "@initiative.dev/schema";
import { Typography } from "@mui/material";
import { StatusContentSchema } from "./status-content.schema.js";

export function StatusContent({
  content,
}: NodeComponentProps<StatusContentSchema>) {
  return (
    <Typography component="div" dangerouslySetInnerHTML={{ __html: content }} />
  );
}
