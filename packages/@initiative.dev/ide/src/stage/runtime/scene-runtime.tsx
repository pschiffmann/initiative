import { ComponentNodeData, SceneDocument } from "#shared";
import { StyleProps } from "@initiative.dev/schema";
import * as $Map from "@pschiffmann/std/map";
import { ComponentType } from "react";
import { createComponentNodeAdapterComponent } from "./component-node-adapter.js";
import { createSlotNodeAdapterComponent } from "./slot-node-adapter.js";

export class SceneRuntime {
  constructor(readonly document: SceneDocument) {
    document.listen("change", ({ nodeIds }) => {
      for (const nodeId of nodeIds ?? []) {
        if (!document.hasNode(nodeId)) this.#adapterComponents.delete(nodeId);
      }
    });
  }

  #adapterComponents = new Map<string, ComponentType<StyleProps>>();

  getAdapterComponent(nodeId: string): ComponentType<StyleProps> {
    return $Map.putIfAbsent(this.#adapterComponents, nodeId, () =>
      this.document.getNode(nodeId) instanceof ComponentNodeData
        ? createComponentNodeAdapterComponent(this, nodeId)
        : createSlotNodeAdapterComponent(this, nodeId),
    );
  }
}
