import { NodeSchema, t } from "@kragle/runtime";

export const SwitchSchema = new NodeSchema("@kragle/template-std::Switch", {
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
