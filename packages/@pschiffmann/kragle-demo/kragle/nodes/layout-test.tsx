import { t } from "@kragle/runtime";
import { NodeSchema } from "@kragle/runtime/v2";
import { ComponentType } from "react";

function createNodeSchema(
  inputs: number,
  outputs: number,
  slots: number
): [ComponentType<any>, NodeSchema] {
  return [
    () => null,
    new NodeSchema(
      `@pschiffmann/kragle-demo::LayoutTest${inputs}i${outputs}o${slots}s`,
      {
        inputs: Object.fromEntries(
          new Array(inputs).fill(null).map((_, i) => [`i${i + 1}`, t.any()])
        ),
        outputs: Object.fromEntries(
          new Array(outputs).fill(null).map((_, i) => [`o${i + 1}`, t.any()])
        ),
        slots: Object.fromEntries(
          new Array(slots).fill(null).map((_, i) => [`s${i + 1}`, {}])
        ),
      }
    ),
  ];
}

export const [LayoutTest0i2o1s, LayoutTest0i2o1sSchema] = createNodeSchema(
  0,
  2,
  1
);
export const [LayoutTest2i0o0s, LayoutTest2i0o0sSchema] = createNodeSchema(
  1,
  0,
  0
);
export const [LayoutTest1i1o1s, LayoutTest1i1o1sSchema] = createNodeSchema(
  1,
  1,
  1
);
export const [LayoutTest2i1o2s, LayoutTest2i1o2sSchema] = createNodeSchema(
  2,
  1,
  2
);
export const [LayoutTest3i1o1s, LayoutTest3i1o1sSchema] = createNodeSchema(
  3,
  1,
  1
);
export const [LayoutTest2i3o2s, LayoutTest2i3o2sSchema] = createNodeSchema(
  2,
  3,
  2
);
export const [LayoutTest5i2o3s, LayoutTest5i2o3sSchema] = createNodeSchema(
  5,
  2,
  3
);
export const [LayoutTest3i6o2s, LayoutTest3i6o2sSchema] = createNodeSchema(
  3,
  6,
  2
);
export const [LayoutTest7i4o4s, LayoutTest7i4o4sSchema] = createNodeSchema(
  7,
  4,
  4
);
