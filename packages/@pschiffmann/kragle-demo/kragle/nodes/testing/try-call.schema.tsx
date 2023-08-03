import { NodeSchema, t } from "@kragle/runtime";

export const TryCallSchema = new NodeSchema(
  "@pschiffmann/kragle-demo::TryCall",
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
