import { t, validateNodeId } from "@initiative.dev/schema";
import { validateSlotNodeOutputName } from "@initiative.dev/schema/internals";
import { ObjectMap } from "@pschiffmann/std/object-map";
import { NodeParent } from "./component-node.js";
import { Expression, ExpressionJson } from "./expression.js";

export interface SlotNodeJson {
  readonly type: "SceneSlot";
  readonly debugPreview: {
    readonly width: number;
    readonly height: number;
    readonly label: string;
  };

  // TODO: rename to `relays`
  readonly outputs: ObjectMap<SlotNodeOutputJson>;
}

export interface SlotNodeOutputJson {
  readonly type: t.TypeJson;
  readonly value: ExpressionJson | null;
}

export interface SlotNodeErrors {
  readonly invalidInputs: ReadonlySet<string>;
}

export class SlotNodeData {
  private constructor(
    readonly id: string,
    readonly debugPreview: SlotNodeJson["debugPreview"],
    readonly outputTypes: ObjectMap<t.Type>,
    readonly outputValues: ObjectMap<Expression | null>,
    readonly parent: NodeParent | null,
  ) {
    const invalidInputs = new Set(
      Object.keys(outputTypes).filter(
        (outputName) => !Object.hasOwn(outputValues, outputName),
      ),
    );
    this.errors = invalidInputs.size !== 0 ? { invalidInputs } : null;
  }

  readonly errors: SlotNodeErrors | null;

  get outputNames() {
    return Object.keys(this.outputTypes);
  }

  setDebugPreview(debugPreview: SlotNodeJson["debugPreview"]): SlotNodeData {
    return new SlotNodeData(
      this.id,
      debugPreview,
      this.outputTypes,
      this.outputValues,
      this.parent,
    );
  }

  createOutput(
    outputName: string,
    type: t.Type,
    value: Expression | null,
  ): SlotNodeData {
    validateSlotNodeOutputName(outputName);
    if (Object.hasOwn(this.outputTypes, outputName)) {
      throw new Error(
        `Output '${outputName}' already exists on node '${this.id}'.`,
      );
    }
    return new SlotNodeData(
      this.id,
      this.debugPreview,
      { ...this.outputTypes, [outputName]: type },
      { ...this.outputValues, [outputName]: value },
      this.parent,
    );
  }

  deleteOutput(outputName: string) {
    if (!Object.hasOwn(this.outputTypes, outputName)) {
      throw new Error(
        `Output '${outputName}' doesn't exist on node '${this.id}'.`,
      );
    }
    const { [outputName]: _type, ...outputTypes } = this.outputTypes;
    const { [outputName]: _value, ...outputValues } = this.outputValues;
    return new SlotNodeData(
      this.id,
      this.debugPreview,
      outputTypes,
      outputValues,
      this.parent,
    );
  }

  setOutput(outputName: string, value: Expression | null) {
    if (!Object.hasOwn(this.outputTypes, outputName)) {
      throw new Error(
        `Output '${outputName}' doesn't exist on node '${this.id}'.`,
      );
    }
    return new SlotNodeData(
      this.id,
      this.debugPreview,
      this.outputTypes,
      { ...this.outputValues, [outputName]: value },
      this.parent,
    );
  }

  rename(id: string): SlotNodeData {
    validateNodeId(id);
    return new SlotNodeData(
      id,
      this.debugPreview,
      this.outputTypes,
      this.outputValues,
      this.parent,
    );
  }

  move(parent: NodeParent): SlotNodeData {
    return new SlotNodeData(
      this.id,
      this.debugPreview,
      this.outputTypes,
      this.outputValues,
      parent,
    );
  }

  toJson(): SlotNodeJson {
    return {
      type: "SceneSlot",
      debugPreview: this.debugPreview,
      outputs: Object.fromEntries(
        this.outputNames.map((outputName) => [
          outputName,
          {
            type: t.toJson(this.outputTypes[outputName]),
            value: this.outputValues[outputName]?.toJson() ?? null,
          },
        ]),
      ),
    };
  }

  static empty(
    id: string,
    debugPreview: SlotNodeJson["debugPreview"] | null,
    parent: NodeParent | null,
  ): SlotNodeData {
    validateNodeId(id);
    return new SlotNodeData(
      id,
      debugPreview ?? { width: 300, height: 150, label: "Placeholder" },
      {},
      {},
      parent,
    );
  }
}
