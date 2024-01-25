import { ObjectMap } from "@pschiffmann/std/object-map";
import * as t from "../type-system/index.js";
import {
  validateNodeSchemaInputName,
  validateNodeSchemaName,
  validateNodeSchemaOutputName,
  validateNodeSchemaSlotName,
} from "../validate-names.js";

//
// NodeSchemaInit
//

interface NodeSchemaInit<
  I extends ObjectMap<InputInit> = {},
  O extends ObjectMap<OutputInit> = {},
  S extends ObjectMap<SlotInit> = {},
> {
  readonly inputs?: I;
  readonly outputs?: O;
  readonly slots?: S;
  readonly editor?: NodeSchemaEditor;
}

export type InputInit = Omit<InputAttributes, "slot">;
export type OutputInit = Omit<OutputAttributes, "slot">;

export interface SlotInit {
  /**
   * If a slot schema has an `inputs` key (even if it is empty), then that slot
   * is a collection slot and can accept any number of children, including 0.
   */
  readonly inputs?: ObjectMap<InputInit>;
  readonly outputs?: ObjectMap<OutputInit>;
}

export interface NodeSchemaEditor {
  readonly color?: string;
  readonly icon?: string;
}

/**
 * This callback can be used to implement custom validation logic. It is only
 * called if `nodeJson` has passed the type system based validation.
 */
// The original idea was that this callback could validate literal inputs. But
// we don't want to enforce that a regular input only accepts literal
// expressions, and the validation doesn't work with node-output expressions.
//
// Solution: Introduce `customInputs` to the node schema. These inputs don't
// accept node-output expressions, instead the schema needs to define a control
// component for each input. The control is specific to this one node type only
// and can't be used anywhere else.
// export type ValidateNode = (nodeJson: unknown /*NodeJson*/) => string | null;

//
// NodeSchema
//

export class NodeSchema<
  I extends ObjectMap<InputInit> = {},
  O extends ObjectMap<OutputInit> = {},
  S extends ObjectMap<SlotInit> = {},
> {
  constructor(
    readonly name: string,
    init: NodeSchemaInit<I, O, S>,
  ) {
    validateNodeSchemaName(name);

    const inputAttributes: Record<string, InputAttributes> = {};
    for (const [inputName, attributes] of Object.entries(init.inputs ?? {})) {
      validateNodeSchemaInputName(name, inputName);
      inputAttributes[inputName] = {
        ...attributes,
        type: attributes.type.canonicalize(),
      };
    }

    const outputAttributes: Record<string, OutputAttributes> = {};
    for (const [outputName, attributes] of Object.entries(init.outputs ?? {})) {
      validateNodeSchemaOutputName(name, outputName);
      outputAttributes[outputName] = {
        ...attributes,
        type: attributes.type.canonicalize(),
      };
    }

    const slotAttributes: Record<string, SlotAttributes> = {};
    for (const [slotName, slotInit] of Object.entries(init.slots ?? {})) {
      const { inputs = {}, outputs = {} } = slotInit;
      validateNodeSchemaSlotName(name, slotName);
      slotAttributes[slotName] = {
        isCollectionSlot: !!slotInit.inputs,
        inputNames: Object.keys(inputs),
        outputNames: Object.keys(outputs),
      };

      for (const [inputName, attributes] of Object.entries(inputs)) {
        validateNodeSchemaInputName(name, inputName);
        if (inputAttributes[inputName]) {
          throw new Error(
            `NodeSchema '${name}' must not contain multiple declarations of ` +
              `input '${inputName}'.`,
          );
        }
        inputAttributes[inputName] = {
          ...attributes,
          type: attributes.type.canonicalize(),
          slot: slotName,
        };
      }

      for (const [outputName, attributes] of Object.entries(outputs)) {
        validateNodeSchemaOutputName(name, outputName);
        if (outputAttributes[outputName]) {
          throw new Error(
            `NodeSchema '${name}' must not contain multiple declarations of ` +
              `output '${outputName}'.`,
          );
        }
        outputAttributes[outputName] = {
          ...attributes,
          type: attributes.type.canonicalize(),
          slot: slotName,
        };
      }
    }

    this.inputAttributes = inputAttributes;
    this.outputAttributes = outputAttributes;
    this.slotAttributes = slotAttributes;
    this.editor = init.editor;
  }

  readonly editor?: NodeSchemaEditor;
  readonly inputAttributes: ObjectMap<InputAttributes>;
  readonly outputAttributes: ObjectMap<OutputAttributes>;
  readonly slotAttributes: { readonly [slotName: string]: SlotAttributes };

  /**
   * Throws an error if `inputName` doesn't exist.
   */
  getInputAttributes(inputName: string): InputAttributes {
    if (!this.inputAttributes[inputName]) {
      throw new Error(
        `Input '${inputName}' doesn't exist on schema '${this.name}'.`,
      );
    }
    return this.inputAttributes[inputName];
  }

  /**
   * Throws an error if `outputName` doesn't exist.
   */
  getOutputAttributes(outputName: string): OutputAttributes {
    if (!this.outputAttributes[outputName]) {
      throw new Error(
        `Output '${outputName}' doesn't exist on schema '${this.name}'.`,
      );
    }
    return this.outputAttributes[outputName];
  }

  /**
   * Throws an error if `slotName` doesn't exist.
   */
  getSlotAttributes(slotName: string): SlotAttributes {
    if (!this.slotAttributes[slotName]) {
      throw new Error(
        `Slot '${slotName}' doesn't exist on schema '${this.name}'.`,
      );
    }
    return this.slotAttributes[slotName];
  }

  forEachInput<R>(
    callback: (inputName: string, attributes: InputAttributes) => R,
  ): R[] {
    return Object.entries(this.inputAttributes).map(([inputName, attributes]) =>
      callback(inputName, attributes),
    );
  }

  forEachOutput<R>(
    callback: (outputName: string, attributes: OutputAttributes) => R,
  ): R[] {
    return Object.entries(this.outputAttributes).map(
      ([outputName, attributes]) => callback(outputName, attributes),
    );
  }

  forEachSlot<R>(
    callback: (slotName: string, slotAttributes: SlotAttributes) => R,
  ): R[] {
    return Object.entries(this.slotAttributes).map(([slotName, attributes]) =>
      callback(slotName, attributes),
    );
  }

  hasRegularOutputs(): boolean {
    return Object.values(this.outputAttributes).some(
      (attributes) => !attributes.slot,
    );
  }

  hasSlots(): boolean {
    return Object.keys(this.slotAttributes).length !== 0;
  }
}

export interface InputAttributes {
  readonly type: t.Type;
  readonly optional?: boolean;
  readonly doc?: string;

  /**
   * If this is a collection input, contains the slot name.
   */
  readonly slot?: string;
}

export interface OutputAttributes {
  readonly type: t.Type;
  readonly doc?: string;

  /**
   * If this is a scoped output, contains the slot name.
   */
  readonly slot?: string;
}

export interface SlotAttributes {
  readonly isCollectionSlot: boolean;
  readonly inputNames: readonly string[];
  readonly outputNames: readonly string[];
}
