import { NodeSchema, t } from "@initiative.dev/schema";

export const IconSchema = new NodeSchema(
  "@initiative.dev/lib-mui-material::Icon",
  {
    inputs: {
      icon: {
        type: t.string(),
      },
    },
  },
);

export type IconSchema = typeof IconSchema;
