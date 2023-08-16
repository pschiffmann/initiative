import { NodeSchema, t } from "@initiativejs/schema";

const flexAlign = t.union(
  t.string("start"),
  t.string("center"),
  t.string("end"),
  t.string("stretch"),
);

export const FlexContainerSchema = new NodeSchema(
  "@initiativejs/template-mui-material",
  {
    inputs: {
      flexDirection: {
        type: t.optional(t.union(t.string("column"), t.string("row"))),
      },
      alignItems: {
        type: t.optional(flexAlign),
      },
      gap: {
        type: t.optional(t.number()),
      },
      padding: {
        type: t.optional(t.string()),
      },
      // backgroundColor: {
      //   type: t.optional(t.string())
      // }
    },
    slots: {
      child: {
        inputs: {
          alignSelf: {
            type: t.optional(flexAlign),
          },
          margin: {
            type: t.optional(t.string()),
          },
        },
      },
    },
  },
);

export type FlexContainerSchema = typeof FlexContainerSchema;
