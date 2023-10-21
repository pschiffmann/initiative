import { NodeSchema, t } from "@initiative.dev/schema";

export const TryCallSchema = new NodeSchema(
  "@pschiffmann/initiative-demo::TryCall",
  {
    inputs: {
      callable: {
        type: t.any(),
      },
    },
    slots: {
      onSuccess: {
        outputs: {
          value: {
            type: t.string(),
          },
        },
      },
      onError: {
        outputs: {
          error: {
            type: t.string(),
          },
        },
      },
    },
  },
);

export type TryCallSchema = typeof TryCallSchema;
