import { NodeSchema, t } from "@initiative.dev/schema";

export const ReadonlyTextAreaSchema = new NodeSchema(
  "@initiative.dev/inventory-game::ReadonlyTextArea",
  {
    inputs: {
      label: {
        type: t.string(),
      },
      value: {
        type: t.string(),
      },
    },
  },
);

export type ReadonlyTextAreaSchema = typeof ReadonlyTextAreaSchema;
