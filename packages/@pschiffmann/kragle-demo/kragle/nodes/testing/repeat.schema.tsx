import { NodeSchema, t } from "@kragle/runtime";

export const RepeatSchema = new NodeSchema("@pschiffmann/kragle-demo::Repeat", {
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
});

export type RepeatSchema = typeof RepeatSchema;
