import { dedent } from "@pschiffmann/std/dedent";
import { NameResolver } from "./name-resolver.js";

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
  nameResolver: NameResolver,
  nodeId: string,
  outputNames: readonly string[],
  children: string,
): string {
  return outputNames.toReversed().reduce((children, outputName) => {
    const Context = nameResolver.declareName(
      getNodeOutputContextName(nodeId, outputName),
    );
    return dedent`
      <${Context}.Provider value={${outputName}}>
        ${children}
      </${Context}.Provider>
      `;
  }, children);
}
