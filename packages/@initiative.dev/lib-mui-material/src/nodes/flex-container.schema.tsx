import { NodeSchema, t } from "@initiative.dev/schema";
import { surfaceInputs } from "./shared-inputs.js";

const flexAlign = t.union(
  t.string("start"),
  t.string("center"),
  t.string("end"),
  t.string("stretch"),
);

export const FlexContainerSchema = new NodeSchema(
  "@initiative.dev/lib-mui-material::FlexContainer",
  {
    inputs: {
      flexDirection: {
        type: t.optional(t.union(t.string("column"), t.string("row"))),
      },
      alignItems: {
        type: t.optional(flexAlign),
      },
      justifyContent: {
        type: t.optional(flexAlign),
      },
      gap: {
        type: t.optional(t.number()),
      },
      padding: {
        type: t.optional(t.string()),
      },
      ...surfaceInputs,
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
