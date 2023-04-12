import { KragleType } from "./kragle-type.js";

class KragleNumber<T extends number = number> extends KragleType<T> {
  constructor(readonly value?: T) {
    super();
  }

  protected override _isAssignableTo(other: KragleType): boolean {
    return (
      KragleNumber.is(other) &&
      (other.value === undefined || other.value === this.value)
    );
  }

  override toString(): string {
    return this.value === undefined ? "number" : `${this.value}`;
  }

  // Workaround for: https://github.com/microsoft/TypeScript/issues/17473
  static is(t: KragleType): t is KragleNumber {
    return t instanceof KragleNumber;
  }
}

function kragleNumber<T extends number>(value?: T): KragleNumber<T> {
  return new KragleNumber(value);
}

export { KragleNumber as Number, kragleNumber as number };
