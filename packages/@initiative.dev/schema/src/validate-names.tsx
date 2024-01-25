import validate from "validate-npm-package-name";

export function validateSceneName(name: string): void {
  if (!name.match(sceneNamePattern) || name.toLowerCase().endsWith("slot")) {
    throw new Error(`Invalid scene name '${name}'.`);
  }
}

export function validateSceneInputName(inputName: string): void {
  if (!inputName.match(nodeIoPattern)) {
    throw new Error(
      `Invalid scene input name '${inputName}': ` +
        `must start with a lowercase letter, and contain only alphanumeric ` +
        `characters, and may contain a single '$' group separator.`,
    );
  }
  if (reservedNames.nodeIo.has(inputName)) {
    throw new Error(
      `Invalid scene input name '${inputName}': ` +
        `This name is reserved for internal use.`,
    );
  }
}

export function validateNodeSchemaName(name: string): void {
  const parts = name.split("::");
  if (parts.length !== 2) {
    throw new Error(
      `Invalid NodeSchema name '${name}': must match the pattern ` +
        `'<package-name>::<node-name>'.`,
    );
  }
  const [packageName, schemaName] = parts;
  if (!validate(packageName).validForNewPackages) {
    throw new Error(
      `Invalid NodeSchema name '${name}': prefix must be an npm package name.`,
    );
  }
  if (!schemaName.match(namespacePattern)) {
    throw new Error(
      `Invalid NodeSchema name '${name}': suffix must start with an ` +
        `uppercase letter, and contain only alphanumeric characters.`,
    );
  }
}

export function validateNodeId(nodeId: string): void {
  if (!nodeId.match(namespacePattern)) {
    throw new Error(
      `Invalid node id '${nodeId}': must start with an uppercase letter, and ` +
        `contain only alphanumeric characters.`,
    );
  }
  if (reservedNames.nodeId.has(nodeId)) {
    throw new Error(
      `Invalid node id '${nodeId}': This name is reserved for internal use.`,
    );
  }
}

export function validateSlotNodeOutputName(outputName: string) {
  if (!outputName.match(nodeIoPattern)) {
    throw new Error(
      `Invalid output name '${outputName}': ` +
        `must start with a lowercase letter, and contain only alphanumeric ` +
        `characters, and may contain a single '$' group separator.`,
    );
  }
  if (reservedNames.nodeIo.has(outputName)) {
    throw new Error(
      `Invalid output name '${outputName}': ` +
        `This name is reserved for internal use.`,
    );
  }
}

export function validateNodeSchemaInputName(
  schemaName: string,
  inputName: string,
): void {
  if (!inputName.match(nodeIoPattern)) {
    throw new Error(
      `Invalid input name '${inputName}' in NodeSchema '${schemaName}': ` +
        `must start with a lowercase letter, and contain only alphanumeric ` +
        `characters, and may contain a single '$' group separator.`,
    );
  }
  if (reservedNames.nodeIo.has(inputName)) {
    throw new Error(
      `Invalid input name '${inputName}' in NodeSchema '${schemaName}': ` +
        `This name is reserved for internal use.`,
    );
  }
}

export function validateNodeSchemaOutputName(
  schemaName: string,
  outputName: string,
): void {
  if (!outputName.match(nodeIoPattern)) {
    throw new Error(
      `Invalid output name '${outputName}' in NodeSchema '${schemaName}': ` +
        `must start with a lowercase letter, and contain only alphanumeric ` +
        `characters, and may contain a single '$' group separator.`,
    );
  }
  if (reservedNames.nodeIo.has(outputName)) {
    throw new Error(
      `Invalid output name '${outputName}' in NodeSchema '${schemaName}': ` +
        `This name is reserved for internal use.`,
    );
  }
}

export function validateNodeSchemaSlotName(
  schemaName: string,
  slotName: string,
): void {
  if (!slotName.match(memberPattern)) {
    throw new Error(
      `Invalid slot name '${slotName}' in NodeSchema '${schemaName}': ` +
        `must start with a lowercase letter, and contain only alphanumeric ` +
        `characters.`,
    );
  }
}

export function validateEntityName(name: string): void {
  const parts = name.split("::");
  if (parts.length !== 2) {
    throw new Error(
      `Invalid EntityType name '${name}': must match the pattern ` +
        `'<package-name>::<entity-name>'.`,
    );
  }
  const [packageName, entityName] = parts;
  if (!validate(packageName).validForNewPackages) {
    throw new Error(
      `Invalid EntityType name '${name}': prefix must be an npm package name.`,
    );
  }
  if (!entityName.match(namespacePattern)) {
    throw new Error(
      `Invalid EntityType name '${name}': suffix must start with an ` +
        `uppercase letter, and contain only alphanumeric characters.`,
    );
  }
}

export function validateLibraryName(name: string): void {
  const parts = name.split("::");
  if (parts.length !== 2) {
    throw new Error(
      `Invalid LibrarySchema name '${name}': must match the pattern ` +
        `'<package-name>::<library-name>'.`,
    );
  }
  const [packageName, schemaName] = parts;
  if (!validate(packageName).validForNewPackages) {
    throw new Error(
      `Invalid LibrarySchema name '${name}': prefix must be an npm package ` +
        `name.`,
    );
  }
  if (!schemaName.match(namespacePattern)) {
    throw new Error(
      `Invalid LibrarySchema name '${name}': suffix must start with an ` +
        `uppercase letter, and contain only alphanumeric characters.`,
    );
  }
}

export function validateLibraryExportName(
  libraryName: string,
  exportName: string,
): void {
  if (!exportName.match(memberPattern)) {
    throw new Error(
      `Invalid export name '${exportName}' in LibrarySchema ` +
        `'${libraryName}': must start with a lowercase letter, and contain ` +
        `only alphanumeric characters.`,
    );
  }
}

export function validateExtensionMethodName(name: string): void {
  const parts = name.split("::");
  if (parts.length !== 2) {
    throw new Error(
      `Invalid ExtensionMethodSchema name '${name}': must match the pattern ` +
        `'<package-name>::<extension-method-name>'.`,
    );
  }
  const [packageName, schemaName] = parts;
  if (!validate(packageName).validForNewPackages) {
    throw new Error(
      `Invalid ExtensionMethodSchema name '${name}': prefix must be an npm ` +
        `package name.`,
    );
  }
  if (!schemaName.match(memberPattern)) {
    throw new Error(
      `Invalid ExtensionMethodSchema name '${name}': suffix must start with ` +
        `an uppercase letter, and contain only alphanumeric characters.`,
    );
  }
}

const sceneNamePattern = /^[A-Za-z][\w-]*$/;
const namespacePattern = /^[A-Z][A-Za-z0-9]*$/;
const memberPattern = /^[a-z][A-Za-z0-9]*$/;
const nodeIoPattern = /^[a-z][A-Za-z0-9]*(?:\$[a-z][A-Za-z0-9]*)?$/;

const reservedNames = {
  nodeId: new Set(["Scene"]),
  nodeIo: new Set(["className", "style", "slots"]),
} as const;
