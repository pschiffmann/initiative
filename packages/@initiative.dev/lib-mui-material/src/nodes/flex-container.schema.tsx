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
        type: t.union(t.string("column"), t.string("row")),
        optional: true,
      },
      alignItems: {
        type: flexAlign,
        optional: true,
      },
      justifyContent: {
        type: t.union(
          t.string("start"),
          t.string("center"),
          t.string("end"),
          t.string("stretch"),
          t.string("space-around"),
          t.string("space-between"),
          t.string("space-evenly"),
        ),
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
      ...surfaceInputs,
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
