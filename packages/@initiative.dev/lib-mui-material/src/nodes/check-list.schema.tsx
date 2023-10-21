import { NodeSchema, t } from "@initiative.dev/schema";

export const CheckListSchema = new NodeSchema(
  "@initiative.dev/lib-mui-material::CheckList",
  {
    inputs: {
      items: {
        type: t.array(t.any()),
      },
      getItemKey: {
        type: t.function(t.any())()(t.string()),
      },
      getPrimaryText: {
        type: t.function(t.any())()(t.string()),
      },
      getSecondaryText: {
        type: t.optional(t.function(t.any())()(t.string())),
      },
      checked: {
        type: t.array(t.string()),
      },
      onCheckedChange: {
        type: t.function(t.string(), t.boolean())()(),
      },
    },
    slots: {
      secondaryAction: {
        outputs: {
          item: {
            type: t.any(),
          },
        },
      },
    },
  },
);

export type CheckListSchema = typeof CheckListSchema;
