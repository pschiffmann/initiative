import * as t from "./index.js";
import { KragleType } from "./kragle-type.js";

class KragleArray<T extends KragleType = KragleType> extends KragleType<
  readonly t.Unwrap<T>[]
> {
  constructor(readonly element: T) {
    super();
  }

  protected override _isAssignableTo(other: KragleType): boolean {
    return KragleArray.is(other) && this.element.isAssignableTo(other.element);
  }

  override toString(): string {
    return `${this.element.toString(true)}[]`;
  }

  // Workaround for: https://github.com/microsoft/TypeScript/issues/17473
  static is(t: KragleType): t is KragleArray {
    return t instanceof KragleArray;
  }
}

function kragleArray<T extends KragleType>(element: T): KragleArray<T> {
  return new KragleArray(element);
}

export { KragleArray as Array, kragleArray as array };
