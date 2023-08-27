import * as t from "../type-system/index.js";
import {
  validateNodeInputName,
  validateNodeOutputName,
  validateNodeSchemaName,
  validateNodeSlotName,
} from "../validate-names.js";

//
// NodeSchemaInit
//

interface NodeSchemaInit<
  I extends NodeSchemaInputs = {},
  O extends NodeSchemaOutputs = {},
  S extends NodeSchemaSlots = {},
> {
  readonly inputs?: I;
  readonly outputs?: O;
  readonly slots?: S;
  readonly editor?: NodeSchemaEditor;
  readonly validate?: ValidateNode;
}

export interface NodeSchemaInputs {
  readonly [inputName: string]: NodeSchemaInput;
}

export interface NodeSchemaInput {
  readonly type: t.Type;
}

export interface NodeSchemaOutputs {
  readonly [inputName: string]: NodeSchemaOutput;
}

export interface NodeSchemaOutput {
  readonly type: t.Type;
}

export interface NodeSchemaSlots {
  readonly [slotName: string]: NodeSchemaSlot;
}

export interface NodeSchemaSlot {
  /**
   * If a slot schema has an `inputs` key (even if it is empty), then that slot
   * is a collection slot and can accept any number of children, including 0.
   */
  readonly inputs?: NodeSchemaInputs;
  readonly outputs?: NodeSchemaOutputs;
}

export interface NodeSchemaEditor {
  readonly color?: string;
}

/**
 * This callback can be used to implement custom validation logic. It is only
 * called if `nodeJson` has passed the type system based validation.
 */
export type ValidateNode = (nodeJson: unknown /*NodeJson*/) => string | null;

//
// NodeSchema
//

export class NodeSchema<
  I extends NodeSchemaInputs = {},
  O extends NodeSchemaOutputs = {},
  S extends NodeSchemaSlots = {},
> {
  constructor(
    readonly name: string,
    init: NodeSchemaInit<I, O, S>,
  ) {
    validateNodeSchemaName(name);

    const canonicalizedInputTypes: Record<string, t.Type> = {};
    for (const [inputName, { type }] of Object.entries(init.inputs ?? {})) {
      validateNodeInputName(name, inputName);
      canonicalizedInputTypes[inputName] = type.canonicalize();
    }

    const canonicalizedOutputTypes: Record<string, t.Type> = {};
    for (const [outputName, { type }] of Object.entries(init.outputs ?? {})) {
      validateNodeOutputName(name, outputName);
      canonicalizedOutputTypes[outputName] = type.canonicalize();
    }

    const slotAttributes: Record<string, SlotAttributes> = {};
    const collectionInputSlots: Record<string, string> = {};
    const scopedOutputSlots: Record<string, string> = {};
    for (const [slotName, slotSchema] of Object.entries(init.slots ?? {})) {
      const { inputs = {}, outputs = {} } = slotSchema;
      validateNodeSlotName(name, slotName);
      slotAttributes[slotName] = {
        isCollectionSlot: !!slotSchema.inputs,
        inputNames: Object.keys(inputs),
        outputNames: Object.keys(outputs),
      };

      for (const [inputName, { type }] of Object.entries(inputs)) {
        validateNodeInputName(name, inputName);
        if (canonicalizedInputTypes[inputName]) {
          throw new Error(
            `NodeSchema '${name}' must not contain multiple declarations of ` +
              `input '${inputName}'.`,
          );
        }
        collectionInputSlots[inputName] = slotName;
        canonicalizedInputTypes[inputName] = type.canonicalize();
      }

      for (const [outputName, { type }] of Object.entries(outputs)) {
        validateNodeOutputName(name, outputName);
        if (canonicalizedOutputTypes[outputName]) {
          throw new Error(
            `NodeSchema '${name}' must not contain multiple declarations of ` +
              `output '${outputName}'.`,
          );
        }
        scopedOutputSlots[outputName] = slotName;
        canonicalizedOutputTypes[outputName] = type.canonicalize();
      }
    }

    this.inputTypes = canonicalizedInputTypes;
    this.collectionInputSlots = collectionInputSlots;
    this.outputTypes = canonicalizedOutputTypes;
    this.scopedOutputSlots = scopedOutputSlots;
    this.slotAttributes = slotAttributes;
    this.validate = init.validate;
    this.editor = init.editor;
  }

  readonly editor?: NodeSchemaEditor;
  readonly inputTypes: t.TypeRecord;

  /**
   * Map from collection input name to slot name it belongs to.
   */
  readonly collectionInputSlots: { readonly [inputName: string]: string };

  readonly outputTypes: t.TypeRecord;

  /**
   * Map from scoped output name to slot name it belongs to.
   */
  readonly scopedOutputSlots: { readonly [outputName: string]: string };

  readonly slotAttributes: { readonly [slotName: string]: SlotAttributes };

  readonly validate?: ValidateNode;

  /**
   * Returns the slot name that `inputName` belongs to, or `null` if `inputName`
   * is a regular input.
   *
   * Throws an error if `inputName` doesn't exist.
   */
  getCollectionInputSlot(inputName: string): string | null {
    if (!this.inputTypes[inputName]) {
      throw new Error(
        `Input '${inputName}' doesn't exist on schema '${this.name}'.`,
      );
    }
    return this.collectionInputSlots[inputName] ?? null;
  }

  /**
   * Returns the slot name that `outputName` belongs to, or `null` if
   * `outputName` is a regular output.
   *
   * Throws an error if `outputName` doesn't exist.
   */
  getScopedOutputSlot(outputName: string): string | null {
    if (!this.outputTypes[outputName]) {
      throw new Error(
        `Output '${outputName}' doesn't exist on schema '${this.name}'.`,
      );
    }
    return this.scopedOutputSlots[outputName] ?? null;
  }

  /**
   * Calls `callback` for each input. If `inputName` is a collection input,
   * `slotName` contains the slot name this input belongs to.
   */
  forEachInput<R>(
    callback: (type: t.Type, inputName: string, slotName?: string) => R,
  ): R[] {
    return Object.entries(this.inputTypes).map(([inputName, type]) =>
      callback(type, inputName, this.collectionInputSlots[inputName]),
    );
  }

  /**
   * Calls `callback` for each input that belongs to `slotName`.
   *
   * Throws an error if `slotName` is not a collection slot.
   */
  forEachCollectionSlotInput<R>(
    slotName: string,
    callback: (type: t.Type, inputName: string) => R,
  ): R[] {
    const slotAttributes = this.slotAttributes[slotName];
    if (!slotAttributes) {
      throw new Error(`NodeSchema '${this.name}' has no slot '${slotName}'.`);
    }
    if (!slotAttributes.isCollectionSlot) {
      throw new Error(
        `Slot '${slotName}' of NodeSchema '${this.name}' is not a collection ` +
          `slot.`,
      );
    }
    return slotAttributes.inputNames.map((inputName) =>
      callback(this.inputTypes[inputName], inputName),
    );
  }

  isCollectionSlot(slotName: string): boolean {
    const slotAttributes = this.slotAttributes[slotName];
    if (!slotAttributes) {
      throw new Error(
        `Slot '${slotName}' doesn't exist on schema '${this.name}'.`,
      );
    }
    return slotAttributes.isCollectionSlot;
  }

  forEachSlot<R>(
    callback: (slotName: string, slotAttributes: SlotAttributes) => R,
  ): R[] {
    return Object.entries(this.slotAttributes).map(([slotName, attributes]) =>
      callback(slotName, attributes),
    );
  }

  forEachOutput<R>(
    callback: (type: t.Type, outputName: string, slotName?: string) => R,
  ): R[] {
    return Object.entries(this.outputTypes).map(([outputName, type]) =>
      callback(type, outputName, this.scopedOutputSlots[outputName]),
    );
  }

  hasSlots(): boolean {
    return Object.keys(this.slotAttributes).length !== 0;
  }

  hasRegularOutputs(): boolean {
    return (
      Object.keys(this.outputTypes).length >
      Object.keys(this.scopedOutputSlots).length
    );
  }
}

export interface SlotAttributes {
  readonly isCollectionSlot: boolean;
  readonly inputNames: readonly string[];
  readonly outputNames: readonly string[];
}
