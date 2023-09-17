import { ComponentType } from "react";
import * as t from "../type-system/index.js";
import { JsonLiteralSchema } from "./json-literal-schema.js";
import { NodeSchema } from "./node-schema.js";

export interface NodeDefinition {
  readonly moduleName: string;
  readonly exportName: string;
  readonly schema: NodeSchema;
  readonly component: ComponentType<any>;
}

export class Definitions {
  constructor(
    readonly entities: ReadonlyMap<string, t.Entity>,
    readonly nodes: ReadonlyMap<string, NodeDefinition>,
    readonly jsonLiterals: ReadonlyMap<string, JsonLiteralSchema>,
  ) {}

  getEntity(entityName: string): t.Entity {
    const entity = this.entities.get(entityName);
    if (entity) return entity;
    throw new Error(`Entity '${entityName}' not found.`);
  }

  getNode(nodeName: string): NodeDefinition {
    const nodeDefinition = this.nodes.get(nodeName);
    if (nodeDefinition) return nodeDefinition;
    throw new Error(`NodeSchema '${nodeName}' not found.`);
  }

  getJsonLiteral(name: string): JsonLiteralSchema {
    const schema = this.jsonLiterals.get(name);
    if (schema) return schema;
    throw new Error(`JsonLiteral '${name}' not found.`);
  }

  merge(other: Definitions): [hasErrors: boolean, definitions: Definitions] {
    let hasErrors = false;
    const entities = new Map(this.entities);
    for (const [entityName, entityType] of other.entities) {
      if (entities.has(entityName)) {
        hasErrors = true;
        console.error(``);
      } else {
        entities.set(entityName, entityType);
      }
    }

    const nodes = new Map(this.nodes);
    for (const [nodeName, nodeSchema] of other.nodes) {
      if (nodes.has(nodeName)) {
        hasErrors = true;
        console.error(``);
      } else {
        nodes.set(nodeName, nodeSchema);
      }
    }

    const jsonLiterals = new Map(this.jsonLiterals);
    for (const [name, schema] of other.jsonLiterals) {
      if (jsonLiterals.has(name)) {
        hasErrors = true;
        console.error(``);
      } else {
        jsonLiterals.set(name, schema);
      }
    }

    return [hasErrors, new Definitions(entities, nodes, jsonLiterals)];
  }
}

export type ModuleRef = [moduleName: string, module: Object];

export function resolveDefinitions(
  moduleRefs: readonly ModuleRef[],
): [hasErrors: boolean, definitions: Definitions] {
  if (moduleRefs.length === 0) {
    throw new Error(`'moduleRefs' must not be empty.`);
  }
  return moduleRefs
    .map((moduleRef) => processModule(moduleRef))
    .reduce(([errors1, definitions1], [errors2, definitions2]) => {
      const [mergeErrors, mergedDefinitions] = definitions1.merge(definitions2);
      return [errors1 || errors2 || mergeErrors, mergedDefinitions];
    });
}

function processModule([moduleName, module]: ModuleRef): [
  hasErrors: boolean,
  definitions: Definitions,
] {
  let hasErrors = false;
  const entities = new Map<string, t.Entity>();

  const nodeSchemas = new Map<string, NodeSchema>();
  const jsonLiterals = new Map<string, JsonLiteralSchema>();
  const otherExports = new Map<string, unknown>();
  for (const [exportName, value] of Object.entries(module)) {
    if (value instanceof t.Entity) {
      if (entities.has(value.name) && entities.get(value.name) !== value) {
        hasErrors = true;
        console.error(
          `Module '${moduleName}' exports multiple 't.entity()' types with ` +
            `name '${value.name}'. Do create entity types only once, then ` +
            `reference that instance in all schemas that need it.`,
        );
      } else {
        entities.set(value.name, value);
      }
    } else if (value instanceof NodeSchema) {
      nodeSchemas.set(exportName, value);
    } else if (value instanceof JsonLiteralSchema) {
      jsonLiterals.set(value.name, value);
    } else {
      otherExports.set(exportName, value);
    }
  }

  const nodes = new Map<string, NodeDefinition>();
  for (const [exportName, schema] of nodeSchemas) {
    const definition = resolveNodeDefinition(
      moduleName,
      exportName,
      schema,
      otherExports,
    );
    if (definition) {
      nodes.set(schema.name, definition);
    } else {
      hasErrors = true;
    }
  }

  if (otherExports.size) {
    hasErrors = true;
    const unmatchedExportsNames = [...otherExports.keys()]
      .map((name) => `'${name}'`)
      .join(", ");
    console.error(
      `Module '${moduleName}' exports the following names that don't belong ` +
        `to a NodeSchema: ${unmatchedExportsNames}. Did you forget to export ` +
        `a schema?`,
    );
  }

  return [hasErrors, new Definitions(entities, nodes, jsonLiterals)];
}

function resolveNodeDefinition(
  moduleName: string,
  schemaExportName: string,
  schema: NodeSchema,
  otherExports: Map<string, unknown>,
): NodeDefinition | null {
  if (!schemaExportName.endsWith("Schema")) {
    console.error(
      `Module '${moduleName}' exports NodeSchema '${schema.name}' with an ` +
        `invalid name. The export name is '${schemaExportName}', but it must ` +
        `end with 'Schema'.`,
    );
    return null;
  }
  const componentExportName = schemaExportName.substring(
    0,
    schemaExportName.length - "Schema".length,
  );
  const component = otherExports.get(componentExportName) as ComponentType;
  otherExports.delete(componentExportName);
  if (!component) {
    console.error(
      `Module '${moduleName}' exports a NodeSchema '${schema.name}' as ` +
        `'${schemaExportName}', but doesn't export a React component as ` +
        `'${componentExportName}'.`,
    );
    return null;
  }
  return {
    moduleName,
    exportName: componentExportName,
    schema,
    component,
  };
}
