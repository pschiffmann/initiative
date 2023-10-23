import { NodeSchema, t } from "@initiative.dev/schema";
import { surfaceInputs } from "./shared-inputs.js";

const placeItem = t.union(
  t.string("start"),
  t.string("center"),
  t.string("end"),
  t.string("stretch"),
);

export const GridContainerSchema = new NodeSchema(
  "@initiative.dev/lib-mui-material::GridContainer",
  {
    inputs: {
      gridTemplate: {
        type: t.string(),
      },
      justifyItems: {
        type: placeItem,
        optional: true,
      },
      alignItems: {
        type: placeItem,
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
          gridArea: {
            type: t.string(),
          },
          justifySelf: {
            type: placeItem,
            optional: true,
          },
          alignSelf: {
            type: placeItem,
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

export type GridContainerSchema = typeof GridContainerSchema;
