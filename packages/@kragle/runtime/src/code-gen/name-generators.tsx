export function getInputAdapterComponentName(nodeId: string): string {
  return `${nodeId}_InputAdapter`;
}

export function getOutputContextName(
  nodeId: string,
  outputName: string
): string {
  return `${nodeId}_${outputName}_Context`;
}
