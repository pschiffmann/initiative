import validate from "validate-npm-package-name";

export function validateNodeSchemaName(name: string): void {
  const parts = name.split("::");
  if (parts.length !== 2) {
    throw new Error(
      `Invalid NodeSchema name '${name}': must match the pattern ` +
        `'<package-name>::<node-name>'.`
    );
  }
  const [packageName, schemaName] = parts;
  if (!validate(packageName).validForNewPackages) {
    throw new Error(
      `Invalid NodeSchema name '${name}': prefix must be an npm package name.`
    );
  }
  if (!schemaName.match(namespacePattern)) {
    throw new Error(
      `Invalid NodeSchema name '${name}': suffix must start with an ` +
        `uppercase letter, and contain only alphanumeric characters.`
    );
  }
}

export function validateNodeId(nodeId: string): void {
  if (!nodeId.match(namespacePattern)) {
    `Invalid node id '${nodeId}': must start with an uppercase letter, and ` +
      `contain only alphanumeric characters.`;
  }
}

export function validateNodeInputName(
  schemaName: string,
  inputName: string
): void {
  if (!inputName.match(memberPattern)) {
    throw new Error(
      `Invalid input name '${inputName}' in NodeSchema '${schemaName}': ` +
        `must start with a lowercase letter, and contain only alphanumeric ` +
        `characters.`
    );
  }
}

export function validateNodeOutputName(
  schemaName: string,
  outputName: string
): void {
  if (!outputName.match(outputPattern)) {
    throw new Error(
      `Invalid output name '${outputName}' in NodeSchema '${schemaName}': ` +
        `must start with a lowercase letter, and contain only alphanumeric ` +
        `characters, and may contain a single '$' group separator.`
    );
  }
}

export function validateNodeSlotName(
  schemaName: string,
  slotName: string
): void {
  if (!slotName.match(memberPattern)) {
    throw new Error(
      `Invalid slot name '${slotName}' in NodeSchema '${schemaName}': ` +
        `must start with a lowercase letter, and contain only alphanumeric ` +
        `characters.`
    );
  }
}

export function validateEntityName(name: string): void {
  const parts = name.split("::");
  if (parts.length !== 2) {
    throw new Error(
      `Invalid EntityType name '${name}': must match the pattern ` +
        `'<package-name>::<entity-name>'.`
    );
  }
  const [packageName, entityName] = parts;
  if (!validate(packageName).validForNewPackages) {
    throw new Error(
      `Invalid EntityType name '${name}': prefix must be an npm package name.`
    );
  }
  if (!entityName.match(namespacePattern)) {
    throw new Error(
      `Invalid EntityType name '${name}': suffix must start with an ` +
        `uppercase letter, and contain only alphanumeric characters.`
    );
  }
}

export function validateLibraryName(name: string): void {
  const parts = name.split("::");
  if (parts.length !== 2) {
    throw new Error(
      `Invalid LibrarySchema name '${name}': must match the pattern ` +
        `'<package-name>::<library-name>'.`
    );
  }
  const [packageName, schemaName] = parts;
  if (!validate(packageName).validForNewPackages) {
    throw new Error(
      `Invalid LibrarySchema name '${name}': prefix must be an npm package ` +
        `name.`
    );
  }
  if (!schemaName.match(namespacePattern)) {
    throw new Error(
      `Invalid LibrarySchema name '${name}': suffix must start with an ` +
        `uppercase letter, and contain only alphanumeric characters.`
    );
  }
}

export function validateLibraryExportName(
  libraryName: string,
  exportName: string
): void {
  if (!exportName.match(memberPattern)) {
    throw new Error(
      `Invalid export name '${exportName}' in LibrarySchema ` +
        `'${libraryName}': must start with a lowercase letter, and contain ` +
        `only alphanumeric characters.`
    );
  }
}

const namespacePattern = /^[A-Z][A-Za-z0-9]*$/;
const memberPattern = /^[a-z][A-Za-z0-9]*$/;
const outputPattern = /^[a-z][A-Za-z0-9]*(?:\$[a-z][A-Za-z0-9]*)$/;
