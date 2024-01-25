import { dedent } from "@pschiffmann/std/dedent";

import { SlotNodeData } from "#shared";
import { NameResolver } from "./name-resolver.js";

export function getSceneInputContextName(
  nameResolver: NameResolver,
  sceneInput: string,
): string {
  return nameResolver.declareName(`Scene$${sceneInput}Context`);
}

export function getNodeOutputContextName(
  nameResolver: NameResolver,
  nodeId: string,
  outputName: string,
): string {
  return nameResolver.declareName(`${nodeId}$${outputName}Context`);
}

export function getSceneSlotContextName(
  nameResolver: NameResolver,
  slotId: string,
) {
  return nameResolver.declareName(`Scene$${slotId}Context`);
}

export function generateOutputContextProviderJsx(
  nameResolver: NameResolver,
  nodeId: string,
  outputNames: readonly string[],
  children: string,
): string {
  return outputNames.toReversed().reduce((children, outputName) => {
    const Context = getNodeOutputContextName(nameResolver, nodeId, outputName);
    return dedent`
      <${Context}.Provider value={${outputName}}>
        ${children}
      </${Context}.Provider>
      `;
  }, children);
}

export function generateSceneSlotContextProviderJsx(
  nameResolver: NameResolver,
  sceneSlots: readonly SlotNodeData[],
  children: string,
): string {
  return sceneSlots.toReversed().reduce((children, { id }) => {
    const Context = getSceneSlotContextName(nameResolver, id);
    return dedent`
      <${Context}.Provider value={slots.${id}}>
        ${children}
      </${Context}.Provider>
      `;
  }, children);
}
