import { NodeSchema, t } from "@initiative.dev/schema";

export const SwitchSchema = new NodeSchema("@initiative.dev/lib-core::Switch", {
  slots: {
    case: {
      inputs: {
        showIf: {
          type: t.boolean(),
        },
      },
    },
  },
});

export type SwitchSchema = typeof SwitchSchema;
