import { NodeSchema, t } from "@initiative.dev/schema";
import { status } from "../../types/index.js";

export { StatusCard } from "../../scenes/status-card/scene.js";

t;

export const StatusCardSchema = new NodeSchema(
  "@pschiffmann/demo-mastodon::StatusCard",
  {
    inputs: {
      status: {
        type: status(),
      },
    },
  },
);
