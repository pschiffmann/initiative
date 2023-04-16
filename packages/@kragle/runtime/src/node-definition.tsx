import { ComponentType } from "react";
import { NodeSchema, SlotSchemas } from "./node-schema.js";
import * as t from "./type-system/index.js";

export interface NodeDefinition {
  readonly importName: string;
  readonly schema: NodeSchema<
    t.KragleTypeRecord,
    t.KragleTypeRecord,
    SlotSchemas
  >;
  readonly component: ComponentType<any>;
}

/**
 * Map of node definitions, indexed by `NodeSchema.name`.
 */
export type NodeDefinitions = ReadonlyMap<string, NodeDefinition>;

export function resolveNodeDefinitions(module: any): NodeDefinitions {
  const result = new Map<string, NodeDefinition>();
  for (const [importName, component] of Object.entries(module)) {
    const schema = module[`${importName}Schema`];
    if (schema instanceof NodeSchema) {
      result.set(schema.name, {
        importName,
        schema,
        component: component as ComponentType<any>,
      });
    }
  }
  return result;
}
