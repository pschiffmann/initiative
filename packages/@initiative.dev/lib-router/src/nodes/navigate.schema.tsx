import { NodeSchema, t } from "@initiative.dev/schema";

export const NavigateSchema = new NodeSchema(
  "@initiative.dev/lib-router::Navigate",
  {
    inputs: {
      path: {
        type: t.string(),
      },
    },
    editor: {
      icon: "alt_route",
    },
  },
);

export type NavigateSchema = typeof NavigateSchema;
