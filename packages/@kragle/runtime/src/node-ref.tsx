import { FC, ReactNode } from "react";
import { NodeSpec } from "./node-spec.js";

export interface NodeComponentProps {
  OutputsProvider: FC<OutputsProviderProps>;
  [inputName: string]: unknown;
}

export interface OutputsProviderProps {
  children?(slots: Readonly<Record<string, FC>>): ReactNode;
  [outputName: string]: unknown;
}

export interface NodeRef {
  readonly spec: NodeSpec;
  readonly component: FC<NodeComponentProps>;
  readonly importPath: readonly string[];
}

export type NodeRefs = ReadonlyMap<string, NodeRef>;

export function resolveNodeRefs(rootModule: any): NodeRefs {
  const result = new Map<string, NodeRef>();

  function visit(module: any, path: readonly string[] = []) {
    if (typeof module !== "object" || module === null) return;
    const { spec, component } = module;
    if (spec instanceof NodeSpec && typeof component === "function") {
      result.set(spec.name, { spec, component, importPath: path });
      return;
    }
    for (const [k, v] of Object.entries(module)) {
      visit(v, [...path, k]);
    }
  }

  visit(rootModule);
  return result;
}
