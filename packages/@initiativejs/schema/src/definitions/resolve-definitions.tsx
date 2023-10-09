import { ComponentType } from "react";
import * as t from "../type-system/index.js";
import { DebugValueSchema, DebugValueSchemas } from "./debug-value-schema.js";
import { ExtensionMethodSchema } from "./extension-method-schema.js";
import { JsonLiteralSchema } from "./json-literal-schema.js";
import { NodeSchema } from "./node-schema.js";

export interface NodeDefinition {
  readonly moduleName: string;
  readonly exportName: string;
  readonly schema: NodeSchema;
  readonly component: ComponentType<any>;
}

export interface ExtensionMethodDefinition {
  readonly moduleName: string;
  readonly exportName: string;
  readonly schema: ExtensionMethodSchema;
  readonly function: (...args: any) => any;
}

interface JsonLiteralDefinition {
  readonly moduleName: string;
  readonly schema: JsonLiteralSchema;
}

export class Definitions<D extends DebugValueSchemas = DebugValueSchemas> {
  constructor(
    readonly extensionMethods: ReadonlyMap<string, ExtensionMethodDefinition>,
    readonly nodes: ReadonlyMap<string, NodeDefinition>,
    readonly jsonLiterals: ReadonlyMap<string, JsonLiteralDefinition>,
    readonly debugValues: ReadonlyMap<string, DebugValueSchema>,
  ) {}

  #entities: ReadonlyMap<string, t.Entity> | null = null;

  #initializeEntities() {
    const entities = (this.#entities = new Map<string, t.Entity>());

    function visit(type: t.Type) {
      if (t.Array.is(type)) {
        visit(type.element);
      } else if (type instanceof t.Entity) {
        entities.set(type.name, type);
      } else if (t.Function.is(type)) {
        for (const parameter of type.parameters) {
          visit(parameter);
        }
        visit(type.returnType);
      } else if (t.Tuple.is(type)) {
        for (const element of type.elements) {
          visit(element);
        }
      } else if (t.Union.is(type)) {
        for (const element of type.elements) {
          visit(element);
        }
      }
    }

    for (const { schema } of this.extensionMethods.values()) {
      visit(schema.type);
    }
    for (const { schema } of this.nodes.values()) {
      for (const { type } of Object.values(schema.inputAttributes)) {
        visit(type);
      }
      for (const { type } of Object.values(schema.outputAttributes)) {
        visit(type);
      }
    }
    for (const { schema } of this.jsonLiterals.values()) {
      visit(schema.type);
    }
    for (const { type } of this.debugValues.values()) {
      visit(type);
    }
  }

  getEntity(entityName: string): t.Entity {
    if (!this.#entities) this.#initializeEntities();
    const entity = this.#entities!.get(entityName);
    if (entity) return entity;
    throw new Error(`Entity '${entityName}' not found.`);
  }

  getExtensionMethod(name: string): ExtensionMethodDefinition {
    const definition = this.extensionMethods.get(name);
    if (definition) return definition;
    throw new Error(`ExtensionMethod '${name}' not found.`);
  }

  getNode(nodeName: string): NodeDefinition {
    const nodeDefinition = this.nodes.get(nodeName);
    if (nodeDefinition) return nodeDefinition;
    throw new Error(`NodeSchema '${nodeName}' not found.`);
  }

  getJsonLiteral(name: string): JsonLiteralSchema {
    const definition = this.jsonLiterals.get(name);
    if (definition) return definition.schema;
    throw new Error(`JsonLiteral '${name}' not found.`);
  }

  getDebugValue(name: string): DebugValueSchema {
    const schema = this.debugValues.get(name);
    if (schema) return schema;
    throw new Error(`DebugValue '${name}' not found.`);
  }

  merge(
    other: Definitions,
    reportError: (message: string) => void,
  ): Definitions<D> {
    const extensionMethods = new Map(this.extensionMethods);
    for (const [name, otherDefinition] of other.extensionMethods) {
      const thisDefinition = extensionMethods.get(name);
      if (thisDefinition) {
        reportError(
          `Modules '${thisDefinition.moduleName}' and ` +
            `'${otherDefinition.moduleName}' both export an extension method ` +
            `'${name}'.`,
        );
      } else {
        extensionMethods.set(name, otherDefinition);
      }
    }

    const nodes = new Map(this.nodes);
    for (const [name, otherDefinition] of other.nodes) {
      const thisDefinition = nodes.get(name);
      if (thisDefinition) {
        reportError(
          `Modules '${thisDefinition.moduleName}' and ` +
            `'${otherDefinition.moduleName}' both export a node schema ` +
            `'${name}'.`,
        );
      } else {
        nodes.set(name, otherDefinition);
      }
    }

    const jsonLiterals = new Map(this.jsonLiterals);
    for (const [name, otherDefinition] of other.jsonLiterals) {
      const thisDefinition = jsonLiterals.get(name);
      if (thisDefinition) {
        reportError(
          `Modules '${thisDefinition.moduleName}' and ` +
            `'${otherDefinition.moduleName}' both export a node schema ` +
            `'${name}'.`,
        );
      } else {
        jsonLiterals.set(name, otherDefinition);
      }
    }

    if (other.debugValues.size) {
      throw new Error(`Can't merge 'Definitions.debugValues'.`);
    }

    return new Definitions(
      extensionMethods,
      nodes,
      jsonLiterals,
      this.debugValues,
    );
  }
}

export type ModuleRef = [moduleName: string, module: Object];

export function resolveDefinitions<D extends DebugValueSchemas>(
  moduleRefs: readonly ModuleRef[],
  debugValues?: D,
  errors?: string[],
): Definitions<D> {
  if (moduleRefs.length === 0) {
    throw new Error(`'moduleRefs' must not be empty.`);
  }

  function reportError(message: string) {
    if (errors) {
      errors.push(message);
    } else {
      throw new Error(message);
    }
  }

  return moduleRefs
    .map((moduleRef) => processModule(moduleRef, reportError))
    .reduce(
      (definitions1, definitions2) =>
        definitions1.merge(definitions2, reportError),
      new Definitions(
        new Map(),
        new Map(),
        new Map(),
        new Map(Object.entries(debugValues ?? {})),
      ),
    );
}

function processModule(
  [moduleName, module]: ModuleRef,
  reportError: (message: string) => void,
): Definitions {
  const extensionMethodSchemas = new Map<string, ExtensionMethodSchema>();
  const nodeSchemas = new Map<string, NodeSchema>();
  const jsonLiterals = new Map<string, JsonLiteralDefinition>();
  const otherExports = new Map<string, unknown>();
  for (const [exportName, value] of Object.entries(module)) {
    if (value instanceof ExtensionMethodSchema) {
      extensionMethodSchemas.set(exportName, value);
    } else if (value instanceof NodeSchema) {
      nodeSchemas.set(exportName, value);
    } else if (value instanceof JsonLiteralSchema) {
      jsonLiterals.set(value.name, { moduleName, schema: value });
    } else {
      otherExports.set(exportName, value);
    }
  }

  const extensionMethods = new Map<string, ExtensionMethodDefinition>();
  for (const [exportName, schema] of extensionMethodSchemas) {
    const definition = resolveExtensionMethodDefinition(
      moduleName,
      exportName,
      schema,
      otherExports,
      reportError,
    );
    if (definition) extensionMethods.set(schema.name, definition);
  }

  const nodes = new Map<string, NodeDefinition>();
  for (const [exportName, schema] of nodeSchemas) {
    const definition = resolveNodeDefinition(
      moduleName,
      exportName,
      schema,
      otherExports,
      reportError,
    );
    if (definition) nodes.set(schema.name, definition);
  }

  if (otherExports.size) {
    const unmatchedExportsNames = [...otherExports.keys()]
      .map((name) => `'${name}'`)
      .join(", ");
    reportError(
      `Module '${moduleName}' exports the following names that don't belong ` +
        `to a schema: ${unmatchedExportsNames}. Did you forget to export ` +
        `schemas for these values?`,
    );
  }

  return new Definitions(extensionMethods, nodes, jsonLiterals, new Map());
}

function resolveExtensionMethodDefinition(
  moduleName: string,
  schemaExportName: string,
  schema: ExtensionMethodSchema,
  otherExports: Map<string, unknown>,
  reportError: (message: string) => void,
): ExtensionMethodDefinition | null {
  if (!schemaExportName.endsWith("Schema")) {
    reportError(
      `Module '${moduleName}' exports ExtensionMethodSchema '${schema.name}' ` +
        `with an invalid name. The export name is '${schemaExportName}', but ` +
        `it must end with 'Schema'.`,
    );
    return null;
  }
  const functionExportName = schemaExportName.substring(
    0,
    schemaExportName.length - "Schema".length,
  );
  const fn = otherExports.get(functionExportName) as (...args: any) => any;
  otherExports.delete(functionExportName);
  if (!fn) {
    reportError(
      `Module '${moduleName}' exports an ExtensionMethodSchema ` +
        `'${schema.name}' as '${schemaExportName}', but doesn't export a ` +
        `function as '${functionExportName}'.`,
    );
    return null;
  }
  return {
    moduleName,
    exportName: functionExportName,
    schema,
    function: fn,
  };
}

function resolveNodeDefinition(
  moduleName: string,
  schemaExportName: string,
  schema: NodeSchema,
  otherExports: Map<string, unknown>,
  reportError: (message: string) => void,
): NodeDefinition | null {
  if (!schemaExportName.endsWith("Schema")) {
    reportError(
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
    reportError(
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
