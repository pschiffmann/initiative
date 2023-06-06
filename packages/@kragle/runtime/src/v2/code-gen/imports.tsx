import * as $Map from "@pschiffmann/std/map";
import { SceneDocument } from "../scene-data/index.js";

export function resolveUsedImports(document: SceneDocument) {
  // `NodeSchema.name`
  const nodeNames = new Set<string>();
  // `Entity.name`
  const entityNames = new Set<string>();
  // Map from member name to `LibrarySchema.name`
  const libraryMembers = new Map<string, Set<string>>();

  for (const nodeId of document.keys()) {
    const node = document.getNode(nodeId);
    nodeNames.add(node.type);
    node.forEachInput((expression) => {
      expression?.map((json) => {
        switch (json.type) {
          case "entity-literal":
            entityNames.add(json.entityName);
            break;
          case "library-member":
            $Map
              .putIfAbsent(libraryMembers, json.memberName, () => new Set())
              .add(json.libraryName);
            break;
        }
        return json;
      });
    });
  }

  const nodeImports = new Map<string, string>();
  for (const nodeName of nodeNames) {
    const definition = document.definitions.getNode(nodeName);
  }
}
