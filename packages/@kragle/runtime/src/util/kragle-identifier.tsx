export function isNodeId(name: string): boolean {
  return !!name.match(nodeIdPattern);
}

export function isInputId(name: string): boolean {
  return !!name.match(inputIdPattern);
}

export function assertIsNodeId(name: string): void {
  if (!isNodeId(name)) {
    throw new Error(`Invalid node id format: '${name}'`);
  }
}

const nodeIdPattern = /^[A-Z][A-Za-z0-9]*$/;
const inputIdPattern = /^[a-z][A-Za-z0-9]*$/;
const outputNamePattern = /^[a-z][A-Za-z0-9]*(?:\$[A-Za-z0-9]+)$/;
