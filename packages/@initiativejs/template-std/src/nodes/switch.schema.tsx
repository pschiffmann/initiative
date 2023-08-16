import { NodeSchema, t } from "@initiativejs/schema";

export const SwitchSchema = new NodeSchema(
  "@initiativejs/template-std::Switch",
  {
    slots: {
      case: {
        inputs: {
          showIf: {
            type: t.boolean(),
          },
        },
      },
    },
  },
);

export type SwitchSchema = typeof SwitchSchema;
