import { InputBindingJson, NodeJson, SceneJson } from "@kragle/runtime";
import fs from "fs";
import {
  LayoutTest0i5oSchema,
  LayoutTest12i3oSchema,
  LayoutTest1i4oSchema,
  LayoutTest2i3oSchema,
  LayoutTest3i12oSchema,
  LayoutTest3i2oSchema,
  LayoutTest4i1oSchema,
  LayoutTest5i0oSchema,
  LayoutTest6i9oSchema,
  LayoutTest9i6oSchema,
} from "../kragle/nodes/layout-test.js";

//
// Generation parameters
//

const fileName = "./kragle/scenes/layout-test.json";
const depth = 10;
const inputProbablity = 0.5;
const childProbablity = 0.2;

// Contains some schemas multiple times to increase their chance of being
// generated.
const schemas = [
  LayoutTest0i5oSchema,
  LayoutTest1i4oSchema,
  LayoutTest1i4oSchema,
  LayoutTest2i3oSchema,
  LayoutTest2i3oSchema,
  LayoutTest2i3oSchema,
  LayoutTest2i3oSchema,
  LayoutTest3i2oSchema,
  LayoutTest3i2oSchema,
  LayoutTest3i2oSchema,
  LayoutTest3i2oSchema,
  LayoutTest4i1oSchema,
  LayoutTest4i1oSchema,
  LayoutTest4i1oSchema,
  LayoutTest5i0oSchema,
  LayoutTest12i3oSchema,
  LayoutTest9i6oSchema,
  LayoutTest6i9oSchema,
  LayoutTest3i12oSchema,
];

function main() {
  const rootNode = "N1";
  const nodes: Record<string, NodeJson> = {};
  generateNode(nodes, [], rootNode, depth);
  const sceneJson: SceneJson = { rootNode, nodes };
  fs.writeFileSync(fileName, JSON.stringify(sceneJson, null, 2));
}

main();

//
// Implementation
//

function generateNode(
  nodes: Record<string, NodeJson>,
  ancestorOutputs: readonly InputBindingJson[],
  nodeId: string,
  maxDepth: number
) {
  const schema = schemas[randomInt(schemas.length)];
  const inputs: Record<string, InputBindingJson> = {};
  for (const inputName of Object.keys(schema.inputs)) {
    if (ancestorOutputs.length !== 0 && Math.random() < inputProbablity) {
      inputs[inputName] = randomElement(ancestorOutputs);
    }
  }
  const slots: Record<string, string> = {};
  for (const [i, slotName] of Object.keys(schema.slots).entries()) {
    if (maxDepth > 0 && Math.random() < childProbablity) {
      slots[slotName] = `${nodeId}x${i + 1}`;
    }
  }
  const nodeJson = (nodes[nodeId] = {
    type: schema.name,
    inputs,
    collectionInputs: {},
    slots,
    collectionSlots: {},
  });

  const nextAncestorOutputs = [
    ...ancestorOutputs,
    ...Object.keys(schema.outputs).map<InputBindingJson>((outputName) => ({
      type: "node-output",
      nodeId,
      outputName,
    })),
  ];
  for (const childNodeId of Object.values(nodeJson.slots)) {
    generateNode(nodes, nextAncestorOutputs, childNodeId, maxDepth - 1);
  }
}

/**
 * Returns a random integer in range [0, max).
 */
function randomInt(max: number): number {
  return Math.trunc(Math.random() * max);
}

function randomElement<T>(array: readonly T[]): T {
  return array[randomInt(array.length)];
}
