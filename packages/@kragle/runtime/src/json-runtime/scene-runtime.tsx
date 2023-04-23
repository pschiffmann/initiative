import * as $Map from "@pschiffmann/std/map";
import { ComponentType } from "react";
import { SceneDocument } from "../scene-document/index.js";
import { createNodeComponent } from "./node-adapter.js";

export class SceneRuntime {
  constructor(readonly sceneDocument: SceneDocument) {
    sceneDocument.subscribe((changedNodeIds) => {
      for (const nodeId of changedNodeIds) {
        const nodeJson = this.sceneDocument.getNode(nodeId);
        if (!nodeJson) {
          this.#nodeComponents.delete(nodeId);
        }
      }
    });
  }

  #nodeComponents = new Map<string, ComponentType>();

  getNodeComponent(nodeId: string): ComponentType {
    return $Map.putIfAbsent(this.#nodeComponents, nodeId, () =>
      createNodeComponent(this, nodeId)
    );
  }
}
