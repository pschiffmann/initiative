import { NodeSchema, t } from "@initiative.dev/schema";

const flexAlign = t.union(
  t.string("start"),
  t.string("center"),
  t.string("end"),
  t.string("stretch"),
);

export const FlexContainerSchema = new NodeSchema(
  "@initiative.dev/lib-mui-material::GridContainer",
  {
    inputs: {
      flexDirection: {
        type: t.union(t.string("column"), t.string("row")),
        optional: true,
      },
      alignItems: {
        type: flexAlign,
        optional: true,
      },
      gap: {
        type: t.number(),
        optional: true,
      },
      padding: {
        type: t.string(),
        optional: true,
      },
      // backgroundColor: {
      //   type: t.optional(t.string())
      // }
    },
    slots: {
      child: {
        inputs: {
          alignSelf: {
            type: flexAlign,
            optional: true,
          },
          margin: {
            type: t.string(),
            optional: true,
          },
        },
      },
    },
  },
);

export type FlexContainerSchema = typeof FlexContainerSchema;
