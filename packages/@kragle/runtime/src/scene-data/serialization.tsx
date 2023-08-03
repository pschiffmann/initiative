import { Definitions } from "../definitions/resolve-definitions.js";
import { ExpressionJson } from "./expression.js";
import { NodeJson, NodeParent } from "./node-data.js";
import { SceneDocument } from "./scene-document.js";

/**
 * Scene serialization format.
 */
export interface SceneJson {
  readonly rootNode: string | null;
  readonly nodes: { readonly [nodeId: string]: NodeJson };
}

export function sceneDocumentFromJson(
  definitions: Definitions,
  name: string,
  sceneJson: SceneJson,
): { errors?: string[]; document?: SceneDocument } {
  const errors: string[] = [];
  const document = new SceneDocument(name, definitions);
  if (!sceneJson.rootNode) return { document };

  if (!isObject(sceneJson, sceneJsonSchema, `'scene.json'`, errors)) {
    return { errors };
  }
  if (!sceneJson.nodes[sceneJson.rootNode]) {
    errors.push(`Root node '${sceneJson.rootNode}' doesn't exist in 'nodes'.`);
    return { errors };
  }

  const queue: string[] = [];

  function discoverNode(
    nodeId: string,
    parent?: Omit<NodeParent, "index">,
  ): boolean {
    const nodeJson = sceneJson.nodes[nodeId];
    if (!isObject(nodeJson, nodeJsonSchema, `Node '${nodeId}'`, errors)) {
      return false;
    }
    try {
      document.applyPatch({
        type: "create-node",
        nodeType: nodeJson.type,
        parent,
        nodeId,
      });
      queue.push(nodeId);
      return true;
    } catch (e) {
      errors.push(
        `Can't create node '${nodeId}': ${e instanceof Error ? e.message : e}`,
      );
      return false;
    }
  }

  function processNode(nodeId: string): void {
    const { inputs, slots } = sceneJson.nodes[nodeId];
    for (const [slotKey, childId] of Object.entries(slots)) {
      const { slotName } = parseSlotKey(nodeId, slotKey, errors);
      if (!slotName || !discoverNode(childId, { nodeId, slotName })) return;
    }
    for (const [inputKey, expression] of Object.entries(inputs)) {
      const { inputName, index } = parseInputKey(nodeId, inputKey, errors);
      if (!inputName || !isExpression(expression, nodeId, inputKey, errors)) {
        continue;
      }
      try {
        document.applyPatch({
          type: "set-node-input",
          nodeId,
          inputName,
          index,
          expression,
        });
      } catch (e) {
        errors.push(
          `Can't set input '${inputKey}' of node '${nodeId}': ` +
            `${e instanceof Error ? e.message : e}`,
        );
      }
    }
  }

  discoverNode(sceneJson.rootNode);
  for (const nodeId of queue) {
    processNode(nodeId);
  }

  return errors.length ? { errors } : { document };
}

export function sceneDocumentToJson(document: SceneDocument): SceneJson {
  const rootNode = document.getRootNodeId();

  const nodes: { [nodeId: string]: NodeJson } = {};
  const queue = rootNode ? [rootNode] : [];
  for (const nodeId of queue) {
    const node = document.getNode(nodeId);
    nodes[nodeId] = node.toJson();
    node.forEachSlot((childId) => {
      if (childId) queue.push(childId);
    });
  }

  return { rootNode, nodes };
}

//
// JSON validation
//

///////////////////////////////////////
//
// JSON schema validation
//
///////////////////////////////////////

const sceneJsonSchema = {
  rootNode: "string",
  nodes: "object",
} satisfies ObjectSchema;

const nodeJsonSchema = {
  type: "string",
  inputs: "object",
  slots: "object",
} satisfies ObjectSchema;

const expressionJsonSchemas = {
  "string-literal": {
    type: "string",
    value: "string",
  },
  "number-literal": {
    type: "string",
    value: "number",
  },
  "boolean-literal": {
    type: "string",
    value: "boolean",
  },
  "entity-literal": {
    type: "string",
    entityName: "string",
    value: "unknown",
  },
  "library-member": {
    type: "string",
    libraryName: "string",
    memberName: "string",
  },
  "scene-input": {
    type: "string",
    inputName: "string",
  },
  "node-output": {
    type: "string",
    nodeId: "string",
    outputName: "string",
  },
  "function-call": {
    type: "string",
    fn: "object",
    args: "array",
  },
} satisfies Record<ExpressionJson["type"], ObjectSchema>;

interface ObjectSchema {
  readonly [K: string]:
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | "unknown";
}

type UnwrapObjectSchema<S extends ObjectSchema> = {
  readonly [K in keyof S]: S[K] extends "string"
    ? string
    : S[K] extends "number"
    ? number
    : S[K] extends "boolean"
    ? boolean
    : S[K] extends "object"
    ? { readonly [key: string]: any }
    : S[K] extends "array"
    ? readonly unknown[]
    : S[K] extends "unknown"
    ? unknown
    : never;
};

/**
 * Returns `true` if `json` matches `schema`. Otherwise, appends error messages
 * to `errors` in-place. Prefixes all error messages with `prefix`.
 */
function isObject<S extends ObjectSchema>(
  json: unknown,
  schema: S,
  prefix: string,
  errors: string[],
): json is UnwrapObjectSchema<S> {
  if (typeof json !== "object" || json === null) {
    errors.push(
      `${prefix} must be a JSON object, but got ` +
        `'${json === null ? "null" : typeof json}'.`,
    );
    return false;
  }

  const errorCountBefore = errors.length;
  const actualKeys = new Set(Object.keys(json));
  for (const [expectedKey, expectedType] of Object.entries(schema)) {
    if (!actualKeys.delete(expectedKey)) {
      errors.push(`${prefix} is missing required key '${expectedKey}'.`);
      continue;
    }
    if (expectedType === "unknown") {
      continue;
    }
    const value = (json as any)[expectedKey];
    if (expectedType === "array" && Array.isArray(value)) {
      continue;
    }
    if (typeof value !== expectedType) {
      errors.push(
        `${prefix} must contain a key '${expectedKey}' with type ` +
          `${expectedType}, but got ${value === null ? "null" : typeof value}.`,
      );
    }
  }
  if (actualKeys.size) {
    errors.push(
      `${prefix} contains unrecognized keys ` +
        [...actualKeys].map((k) => JSON.stringify(k)).join(", ") +
        ".",
    );
  }
  return errorCountBefore === errors.length;
}

function isExpression(
  json: unknown,
  nodeId: string,
  inputKey: string,
  errors: string[],
): json is ExpressionJson {
  function visit(json: ExpressionJson, path = "") {
    const prefix =
      `At node '${nodeId}', in input '${inputKey}': expression ` +
      (path || `'/'`);
    if (typeof json !== "object" || json === null) {
      errors.push(`${prefix} must be a JSON object.`);
      return;
    }
    const schema = expressionJsonSchemas[json.type];
    if (!schema) {
      errors.push(
        `${prefix} must have a 'type' key with value ` +
          Object.keys(expressionJsonSchemas)
            .map((s) => `'${s}'`)
            .join(", ") +
          ".",
      );
      return;
    }
    if (!isObject(json, schema, prefix, errors)) {
      return;
    }
    if (json.type === "function-call") {
      visit(json.fn, `${path}/fn`);
      for (const [i, arg] of json.args.entries()) {
        if (arg !== null) visit(arg, `${path}/arg(${i})`);
      }
    }
  }

  const errorCountBefore = errors.length;
  visit(json as ExpressionJson);
  return errorCountBefore === errors.length;
}

function parseInputKey(
  nodeId: string,
  inputKey: string,
  errors: string[],
): { inputName?: string; index?: number } {
  if (!inputKey.match(nodePropPattern)) {
    errors.push(`Node '${nodeId}' contains invalid input '${inputKey}'.`);
    return {};
  }
  const [inputName, index] = inputKey.split("::");
  return { inputName, index: index ? Number.parseInt(index) : undefined };
}

function parseSlotKey(
  nodeId: string,
  slotKey: string,
  errors: string[],
): { slotName?: string; index?: number } {
  if (!slotKey.match(nodePropPattern)) {
    errors.push(`Node '${nodeId}' contains invalid slot '${slotKey}'.`);
    return {};
  }
  const [slotName, index] = slotKey.split("::");
  return { slotName, index: index ? Number.parseInt(index) : undefined };
}

const nodePropPattern = /^[a-z][A-Za-z0-9]*(?:::\d+)?$/;
