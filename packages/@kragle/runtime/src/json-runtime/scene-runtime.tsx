import * as $Map from "@pschiffmann/std/map";
import { Context, createContext, FC } from "react";
import { NodeRefs, OutputsProviderProps } from "../node-ref.js";
import { withProps } from "../util/with-props.js";
import { NodeAdapter, OutputsProvider } from "./node-adapter.js";
import { SceneJson } from "./scene-document.js";

export class SceneRuntime {
  constructor(readonly sceneJson: SceneJson, readonly nodeRefs: NodeRefs) {}

  /** Map from node id to `WithProps(NodeComponent)`. */
  #adapterComponents = new Map<string, FC>();

  getAdapterComponent(nodeId: string): FC {
    return $Map.putIfAbsent(this.#adapterComponents, nodeId, () =>
      withProps(NodeAdapter, { nodeId, runtime: this })
    );
  }

  #outputsProviderComponents = new Map<string, FC<OutputsProviderProps>>();

  getOutputsProviderComponent(nodeId: string): FC<OutputsProviderProps> {
    return $Map.putIfAbsent(this.#outputsProviderComponents, nodeId, () =>
      withProps(OutputsProvider, { nodeId, runtime: this })
    );
  }

  #outputContexts = new Map<string, Context<unknown>>();

  getContextForNodeOutput(outputId: string): Context<unknown> {
    return $Map.putIfAbsent(this.#outputContexts, outputId, () =>
      createContext<unknown>(undefined)
    );
  }
}

export function useRootNode(runtime: SceneRuntime): string {
  return runtime.sceneJson.rootNode;
}
