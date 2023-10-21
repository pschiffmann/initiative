import { ComponentType } from "react";
import * as t from "../type-system/index.js";

export interface JsonLiteralSchemaInit<T = unknown> {
  readonly name: string;
  readonly type: t.Type<T>;
  readonly doc?: string;
  readonly initialValue: () => T;
  readonly validate: ValidateJsonLiteral;
  readonly format: (value: T) => string;
  readonly control: ComponentType<JsonLiteralControlProps<T>>;
}

export type ValidateJsonLiteral = (value: unknown) => string | null;

export interface JsonLiteralControlProps<T> {
  label: string;
  helpText?: string;
  dense?: boolean;
  value: T;
  onChange(value: T): void;
  onClear(): void;
}

export class JsonLiteralSchema<T = unknown> {
  constructor(init: JsonLiteralSchemaInit<T>) {
    this.name = init.name;
    this.type = init.type;
    this.doc = init.doc;
    this.initialValue = init.initialValue;
    this.validate = init.validate;
    this.format = init.format;
    this.control = init.control;
  }

  readonly name: string;
  readonly type: t.Type<T>;
  readonly doc?: string;
  readonly initialValue: () => T;
  readonly validate: ValidateJsonLiteral;
  readonly format: (value: T) => string;
  readonly control: ComponentType<JsonLiteralControlProps<T>>;
}
