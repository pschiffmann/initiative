import { SceneDocument } from "#shared";
import * as $Map from "@pschiffmann/std/map";
import { ComponentType } from "react";
import { createNodeAdapterComponent } from "./node-adapter.js";

export class SceneRuntime {
  constructor(readonly document: SceneDocument) {
    document.listen("change", (nodeIds) => {
      for (const nodeId of nodeIds) {
        if (!document.hasNode(nodeId)) this.#adapterComponents.delete(nodeId);
      }
    });
  }

  #adapterComponents = new Map<string, ComponentType>();

  getAdapterComponent(nodeId: string): ComponentType {
    return $Map.putIfAbsent(this.#adapterComponents, nodeId, () =>
      createNodeAdapterComponent(this, nodeId),
    );
  }
}
