export function isNodeId(name: string): boolean {
  return !!name.match(nodeIdPattern);
}

export function isInputId(name: string): boolean {
  return !!name.match(inputIdPattern);
}

const nodeIdPattern = /^[A-Z][A-Za-z0-9]*$/;
const inputIdPattern = /^[a-z][A-Za-z0-9]*$/;
