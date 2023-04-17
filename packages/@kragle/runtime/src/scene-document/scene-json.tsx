import { NodeSchema, SlotSchemas } from "../node-schema.js";
import * as t from "../type-system/index.js";

export interface SceneJson {
  readonly rootNode: string;
  readonly nodes: Readonly<Record<string, NodeJson>>;
}

export interface NodeJson {
  readonly type: string;

  /**
   * `SceneDocument` will keep the array length of collection input arrays equal
   * to the number of slot children, and fill unassigned inputs with `null`s.
   *
   * `parseSceneJson()` also accepts arrays that have fewer elements that the
   * slot has children.
   */
  readonly inputs: Readonly<
    Record<string, NodeInputJson | readonly (NodeInputJson | null)[]>
  >;

  /**
   * Mapping from slot name to child node id.
   */
  readonly slots: Readonly<Record<string, string | readonly string[]>>;
}

export type NodeInputJson =
  | {
      readonly type: "binding";
      readonly nodeId: string;
      readonly output: string;
    }
  // | {
  //     readonly type: "external";
  //     readonly sceneProp: string;
  //   }
  | {
      readonly type: "constant";
      readonly value: string | number | boolean;
    };

export function createNodeJson(
  schema: NodeSchema<t.KragleTypeRecord, t.KragleTypeRecord, SlotSchemas>
): NodeJson {
  const inputs: Record<string, null[]> = {};
  const slots: Record<string, string[]> = {};
  for (const [slotName, slotSchema] of Object.entries(schema.slots ?? {})) {
    if (slotSchema.inputs) {
      inputs[slotName] = [];
      slots[slotName] = [];
    }
  }
  return { type: schema.name, inputs, slots };
}
