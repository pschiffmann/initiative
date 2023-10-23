import { NodeSchema } from "@initiative.dev/schema";

export const StatusContainerSchema = new NodeSchema(
  "@pschiffmann/demo-mastodon::StatusContainer",
  {
    slots: {
      header: {},
      child: {},
    },
  },
);

export type StatusContainerSchema = typeof StatusContainerSchema;
