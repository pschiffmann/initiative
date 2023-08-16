import { NodeSchema, t } from "@initiativejs/schema";

export const RepeatSchema = new NodeSchema(
  "@pschiffmann/initiative-demo::Repeat",
  {
    inputs: {
      collection: {
        type: t.array(t.any()),
      },
    },
    outputs: {
      isEmpty: {
        type: t.boolean(),
      },
    },
    slots: {
      child: {
        outputs: {
          index: {
            type: t.number(),
          },
          item: {
            type: t.any(),
          },
        },
      },
    },
  },
);

export type RepeatSchema = typeof RepeatSchema;
