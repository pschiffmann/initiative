import { Definitions, t } from "@initiativejs/schema";
import { ProjectConfig } from "../project-config.js";
import { ExpressionJson, ExpressionSelectorJson } from "./expression.js";
import { NodeJson, NodeParent } from "./node-data.js";
import { SceneDocument } from "./scene-document.js";

/**
 * Scene serialization format.
 */
export interface SceneJson {
  readonly rootNode: string | null;
  readonly inputs: { readonly [inputName: string]: SceneInputJson };
  readonly nodes: { readonly [nodeId: string]: NodeJson };
}

export interface SceneInputJson {
  readonly type: t.TypeJson;
  readonly doc: string;
  readonly debugValue: ExpressionJson | null;
}

export function sceneDocumentFromJson(
  definitions: Definitions,
  projectConfig: ProjectConfig,
  name: string,
  sceneJson: SceneJson,
): { errors?: string[]; document?: SceneDocument } {
  const errors: string[] = [];
  const document = new SceneDocument(name, definitions, projectConfig);
  if (!sceneJson.rootNode) return { document };

  if (!isObject(sceneJson, sceneJsonSchema, `'scene.json'`, errors)) {
    return { errors };
  }
  if (!sceneJson.nodes[sceneJson.rootNode]) {
    errors.push(`Root node '${sceneJson.rootNode}' doesn't exist in 'nodes'.`);
    return { errors };
  }

  // Parse `sceneJson.inputs`
  for (const [inputName, inputJson] of Object.entries(sceneJson.inputs)) {
    try {
      document.applyPatch({ type: "set-scene-input", inputName, inputJson });
    } catch (e) {
      errors.push(
        `Can't create scene input '${inputName}': ` +
          (e instanceof Error ? e.message : e),
      );
    }
  }

  // Parse `sceneJson.nodes`
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
  const inputs: { [inputName: string]: SceneInputJson } = {};
  for (const [inputName, inputData] of document.sceneInputs) {
    inputs[inputName] = {
      type: t.toJson(inputData.type),
      doc: inputData.doc,
      debugValue: inputData.debugValue?.toJson() ?? null,
    };
  }

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

  return { inputs, rootNode, nodes };
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
  inputs: "object",
  rootNode: "string",
  nodes: "object",
} satisfies ObjectSchema;

const nodeJsonSchema = {
  type: "string",
  inputs: "object",
  slots: "object",
} satisfies ObjectSchema;

const expressionJsonSchemas = {
  "json-literal": {
    type: "string",
    schemaName: "string",
    value: "unknown",
  },
  "enum-value": {
    type: "string",
    value: "unknown",
  },
  "fluent-message": {
    type: "string",
    messages: "object",
    args: "object",
  },
  "scene-input": {
    type: "string",
    inputName: "string",
    selectors: "array",
  },
  "node-output": {
    type: "string",
    nodeId: "string",
    outputName: "string",
    selectors: "array",
  },
  "debug-value": {
    type: "string",
    debugValueName: "string",
    selectors: "array",
  },
} satisfies Record<ExpressionJson["type"], ObjectSchema>;

const expressionSelectorJsonSchemas = {
  property: {
    type: "string",
    propertyName: "string",
  },
  method: {
    type: "string",
    methodName: "string",
    args: "array",
  },
  call: {
    type: "string",
    args: "array",
  },
  "extension-method": {
    type: "string",
    extensionMethodName: "string",
    args: "array",
  },
} satisfies Record<ExpressionSelectorJson["type"], ObjectSchema>;

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
  function visit(
    json: ExpressionJson,
    prefix = `At node ${nodeId}: input ${inputKey}`,
  ) {
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
    switch (json.type) {
      case "enum-value":
        if (typeof json.value !== "string" && typeof json.value !== "number") {
          errors.push(
            `${prefix} must contain a key 'type' with type string or number, ` +
              `but got ${json.value === null ? "null" : typeof json.value}.`,
          );
          return;
        }
        break;
      case "fluent-message":
        for (const [locale, message] of Object.entries(json.messages)) {
          if (typeof message !== "string") {
            errors.push(`${prefix}.messages.${locale} must be a string.`);
          }
        }
        for (const [variable, expression] of Object.entries(json.args)) {
          visit(expression, `${prefix}.args.${variable}`);
        }
        break;
      case "scene-input":
      case "node-output":
      case "debug-value": {
        for (const [i, selector] of json.selectors.entries()) {
          if (typeof selector !== "object" || selector === null) {
            errors.push(`${prefix}.${i} must be a JSON object.`);
            return;
          }
          const selectorSchema = expressionSelectorJsonSchemas[selector.type];
          if (!selectorSchema) {
            errors.push(
              `${prefix}.${i} must have a 'type' key with value ` +
                Object.keys(expressionJsonSchemas)
                  .map((s) => `'${s}'`)
                  .join(", ") +
                ".",
            );
            return;
          }
          if (!isObject(selector, selectorSchema, prefix, errors)) {
            return;
          }
          if (selector.type === "property") continue;
          for (const [j, arg] of selector.args.entries()) {
            if (arg !== null) visit(arg, `${prefix}.${i}.args.${j}`);
          }
        }
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
