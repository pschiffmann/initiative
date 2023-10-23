import { NodeSchema, t } from "@initiative.dev/schema";

export const StatusContentSchema = new NodeSchema(
  "@pschiffmann/demo-mastodon::StatusContent",
  {
    inputs: {
      content: {
        type: t.string(),
      },
    },
  },
);

export type StatusContentSchema = typeof StatusContentSchema;
