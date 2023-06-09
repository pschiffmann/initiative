import {
  ExpressionJson,
  NodeJson,
  NodeSchema,
  SceneJson,
} from "@kragle/runtime/v2";
import fs from "fs";
import {
  LayoutTest0i2o1sSchema,
  LayoutTest1i1o1sSchema,
  LayoutTest2i0o0sSchema,
  LayoutTest2i1o2sSchema,
  LayoutTest2i3o2sSchema,
  LayoutTest3i1o1sSchema,
  LayoutTest3i6o2sSchema,
  LayoutTest5i2o3sSchema,
  LayoutTest7i4o4sSchema,
} from "../kragle/nodes/index.js";

//
// Generation parameters
//

const fileName = "./kragle/scenes/layout-test.json";
const depth = 10;
const inputProbablity = 0.5;
const childProbablity = 0.5;
const minNodes = 50;
const maxNodes = 200;

// Contains some schemas multiple times to increase their chance of being
// generated.
const schemas = generateSchemasArray([
  [LayoutTest0i2o1sSchema, 3],
  [LayoutTest2i0o0sSchema, 3],
  [LayoutTest1i1o1sSchema, 5],
  [LayoutTest2i1o2sSchema, 5],
  [LayoutTest3i1o1sSchema, 5],
  [LayoutTest2i3o2sSchema, 5],
  [LayoutTest5i2o3sSchema, 1],
  [LayoutTest3i6o2sSchema, 1],
  [LayoutTest7i4o4sSchema, 1],
]);

function main() {
  const rootNode = "N1";
  let nodes: Record<string, NodeJson> = {};
  while (
    Object.keys(nodes).length < minNodes ||
    Object.keys(nodes).length > maxNodes
  ) {
    nodes = {};
    generateNode(nodes, [], rootNode, depth);
  }

  const sceneJson: SceneJson = { rootNode, nodes };
  fs.writeFileSync(fileName, JSON.stringify(sceneJson, null, 2) + "\n");
}

main();

//
// Implementation
//

function generateNode(
  nodes: Record<string, NodeJson>,
  ancestorOutputs: readonly ExpressionJson[],
  nodeId: string,
  maxDepth: number
) {
  const schema = schemas[randomInt(schemas.length)];
  const inputs: Record<string, ExpressionJson> = {};
  for (const inputName of Object.keys(schema.inputTypes)) {
    if (ancestorOutputs.length !== 0 && Math.random() < inputProbablity) {
      inputs[inputName] = randomElement(ancestorOutputs);
    }
  }
  const slots: Record<string, string> = {};
  for (const [i, slotName] of Object.keys(schema.slotAttributes).entries()) {
    if (maxDepth > 0 && Math.random() < childProbablity) {
      slots[slotName] = `${nodeId}x${i + 1}`;
    }
  }
  const nodeJson = (nodes[nodeId] = {
    type: schema.name,
    inputs,
    slots,
  });

  const nextAncestorOutputs = [
    ...ancestorOutputs,
    ...Object.keys(schema.outputTypes).map<ExpressionJson>((outputName) => ({
      type: "node-output",
      nodeId,
      outputName,
    })),
  ];
  for (const childNodeId of Object.values(nodeJson.slots)) {
    generateNode(nodes, nextAncestorOutputs, childNodeId, maxDepth - 1);
  }
}

function generateSchemasArray(
  schemas: Iterable<[NodeSchema, number]>
): NodeSchema[] {
  const result: NodeSchema[] = [];
  for (const [schema, repeat] of schemas) {
    for (let i = 0; i < repeat; i++) {
      result.push(schema);
    }
  }
  return result;
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
