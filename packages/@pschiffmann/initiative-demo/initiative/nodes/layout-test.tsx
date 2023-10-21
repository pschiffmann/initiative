import { NodeSchema, t } from "@initiative.dev/schema";
import { ComponentType } from "react";

function createNodeSchema(
  inputs: number,
  outputs: number,
  slots: number,
): [ComponentType<any>, NodeSchema] {
  return [
    () => null,
    new NodeSchema(
      `@pschiffmann/initiative-demo::LayoutTest${inputs}i${outputs}o${slots}s`,
      {
        inputs: Object.fromEntries(
          new Array(inputs)
            .fill(null)
            .map((_, i) => [`i${i + 1}`, { type: t.any() }]),
        ),
        outputs: Object.fromEntries(
          new Array(outputs)
            .fill(null)
            .map((_, i) => [`o${i + 1}`, { type: t.any() }]),
        ),
        slots: Object.fromEntries(
          new Array(slots).fill(null).map((_, i) => [`s${i + 1}`, {}]),
        ),
      },
    ),
  ];
}

export const [LayoutTest0i2o1s, LayoutTest0i2o1sSchema] = createNodeSchema(
  0,
  2,
  1,
);
export type LayoutTest0i2o1sSchema = typeof LayoutTest0i2o1sSchema;

export const [LayoutTest2i0o0s, LayoutTest2i0o0sSchema] = createNodeSchema(
  1,
  0,
  0,
);
export type LayoutTest2i0o0sSchema = typeof LayoutTest2i0o0sSchema;

export const [LayoutTest1i1o1s, LayoutTest1i1o1sSchema] = createNodeSchema(
  1,
  1,
  1,
);
export type LayoutTest1i1o1sSchema = typeof LayoutTest1i1o1sSchema;

export const [LayoutTest2i1o2s, LayoutTest2i1o2sSchema] = createNodeSchema(
  2,
  1,
  2,
);
export type LayoutTest2i1o2sSchema = typeof LayoutTest2i1o2sSchema;

export const [LayoutTest3i1o1s, LayoutTest3i1o1sSchema] = createNodeSchema(
  3,
  1,
  1,
);
export type LayoutTest3i1o1sSchema = typeof LayoutTest3i1o1sSchema;

export const [LayoutTest2i3o2s, LayoutTest2i3o2sSchema] = createNodeSchema(
  2,
  3,
  2,
);
export type LayoutTest2i3o2sSchema = typeof LayoutTest2i3o2sSchema;

export const [LayoutTest5i2o3s, LayoutTest5i2o3sSchema] = createNodeSchema(
  5,
  2,
  3,
);
export type LayoutTest5i2o3sSchema = typeof LayoutTest5i2o3sSchema;

export const [LayoutTest3i6o2s, LayoutTest3i6o2sSchema] = createNodeSchema(
  3,
  6,
  2,
);
export type LayoutTest3i6o2sSchema = typeof LayoutTest3i6o2sSchema;

export const [LayoutTest7i4o4s, LayoutTest7i4o4sSchema] = createNodeSchema(
  7,
  4,
  4,
);
export type LayoutTest7i4o4sSchema = typeof LayoutTest7i4o4sSchema;
