import * as t from "./index.js";
import { KragleType } from "./kragle-type.js";

class KragleBoolean<T extends boolean = boolean> extends KragleType<T> {
  constructor(readonly value?: T) {
    super();
  }

  override isAssignableTo(other: KragleType): boolean {
    return this.value === undefined
      ? t.union(t.boolean(true), t.boolean(false)).isAssignableTo(other)
      : super.isAssignableTo(other);
  }

  protected override _isAssignableTo(other: KragleType): boolean {
    return (
      KragleBoolean.is(other) &&
      (other.value === undefined || other.value === this.value)
    );
  }

  override toString(): string {
    return this.value === undefined ? "boolean" : `${this.value}`;
  }

  // Workaround for: https://github.com/microsoft/TypeScript/issues/17473
  static is(t: KragleType): t is KragleBoolean {
    return t instanceof KragleBoolean;
  }
}

function kragleBoolean<T extends boolean>(value?: T): KragleBoolean<T> {
  return new KragleBoolean(value);
}

export { KragleBoolean as Boolean, kragleBoolean as boolean };
