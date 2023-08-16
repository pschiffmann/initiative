import * as t from "./index.js";
import { Type } from "./type.js";

class InitiativeBoolean<T extends boolean = boolean> extends Type<T> {
  constructor(readonly value?: T) {
    super();
  }

  override isAssignableTo(other: Type): boolean {
    return this.value === undefined
      ? t.union(t.boolean(true), t.boolean(false)).isAssignableTo(other)
      : super.isAssignableTo(other);
  }

  protected override _isAssignableTo(other: Type): boolean {
    return (
      InitiativeBoolean.is(other) &&
      (other.value === undefined || other.value === this.value)
    );
  }

  override toString(): string {
    return this.value === undefined ? "boolean" : `${this.value}`;
  }

  // Workaround for: https://github.com/microsoft/TypeScript/issues/17473
  static is(t: Type): t is InitiativeBoolean {
    return t instanceof InitiativeBoolean;
  }
}

function initiativeBoolean<T extends boolean>(value?: T): InitiativeBoolean<T> {
  return new InitiativeBoolean(value);
}

export { InitiativeBoolean as Boolean, initiativeBoolean as boolean };
