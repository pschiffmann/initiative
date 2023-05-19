import { NodeSchema, t } from "@kragle/runtime";
import { ComponentType } from "react";

function createNodeSchema(
  inputs: number,
  outputs: number
): [ComponentType<any>, NodeSchema] {
  return [
    () => null,
    new NodeSchema(`@pschiffmann/kragle-demo/LayoutTest${inputs}i${outputs}o`, {
      inputs: Object.fromEntries(
        new Array(inputs).fill(null).map((_, i) => [`i${i + 1}`, t.any()])
      ),
      outputs: Object.fromEntries(
        new Array(inputs).fill(null).map((_, i) => [`o${i + 1}`, t.any()])
      ),
      slots: {
        c1: {},
        c2: {},
        c3: {},
        c4: {},
        // c5: {},
        // c6: {},
        // c7: {},
        // c8: {},
      },
    }),
  ];
}

export const [LayoutTest0i5o, LayoutTest0i5oSchema] = createNodeSchema(0, 5);
export const [LayoutTest1i4o, LayoutTest1i4oSchema] = createNodeSchema(1, 4);
export const [LayoutTest2i3o, LayoutTest2i3oSchema] = createNodeSchema(2, 3);
export const [LayoutTest3i2o, LayoutTest3i2oSchema] = createNodeSchema(3, 2);
export const [LayoutTest4i1o, LayoutTest4i1oSchema] = createNodeSchema(4, 1);
export const [LayoutTest5i0o, LayoutTest5i0oSchema] = createNodeSchema(5, 0);

export const [LayoutTest12i3o, LayoutTest12i3oSchema] = createNodeSchema(12, 3);
export const [LayoutTest9i6o, LayoutTest9i6oSchema] = createNodeSchema(9, 6);
export const [LayoutTest6i9o, LayoutTest6i9oSchema] = createNodeSchema(6, 9);
export const [LayoutTest3i12o, LayoutTest3i12oSchema] = createNodeSchema(3, 12);
