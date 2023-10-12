export function getSceneInputContextName(sceneInput: string): string {
  return `Scene$${sceneInput}Context`;
}

export function getNodeOutputContextName(
  nodeId: string,
  outputName: string,
): string {
  return `${nodeId}$${outputName}Context`;
}

export function generateContextProviderJsx(
  nodeId: string,
  outputNames: readonly string[],
  children: string,
): string {
  return outputNames.toReversed().reduce(
    (children, outputName) =>
      `<${nodeId}$${outputName}Context.Provider value={${outputName}}>
  ${children}
</${nodeId}$${outputName}Context.Provider>`,
    children,
  );
}
