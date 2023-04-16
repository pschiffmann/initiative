import { ComponentType } from "react";
import { NodeSchema } from "./node-schema.js";

export interface NodeDefinition {
  readonly importName: string;
  readonly schema: NodeSchema;
  readonly component: ComponentType;
}

/**
 * Map of node definitions, indexed by `NodeSchema.name`.
 */
export type NodeDefinitions = ReadonlyMap<string, NodeDefinition>;

export function resolveNodeDefinitions(module: any): NodeDefinitions {
  const result = new Map<string, NodeDefinition>();
  for (const [name, value] of Object.entries(module)) {
    const maybeSchema = module[`${name}Spec`];
    if (maybeSchema instanceof NodeSchema) {
      result.set(maybeSchema.name, {
        importName: name,
        schema: maybeSchema,
        component: value as ComponentType,
      });
    }
  }
  return result;
}
