import * as t from "./index.js";
import { KragleType } from "./kragle-type.js";

class KragleTuple<
  E extends t.KragleTypeArray = t.KragleTypeArray,
> extends KragleType<t.UnwrapArray<E>> {
  constructor(readonly elements: E) {
    if (elements.length === 0) {
      throw new Error("Tuple cannot be empty.");
    }
    super();
  }

  protected override _isAssignableTo(other: KragleType): boolean {
    if (t.Array.is(other)) {
      return this.elements.every((element) =>
        element.isAssignableTo(other.element),
      );
    }
    if (KragleTuple.is(other)) {
      return (
        this.elements.length === other.elements.length &&
        this.elements.every((element, i) =>
          element.isAssignableTo(other.elements[i]),
        )
      );
    }
    return false;
  }

  override canonicalize(): t.KragleType {
    return new KragleTuple(this.elements.map((e) => e.canonicalize()));
  }

  override toString(): string {
    return `[${this.elements.join(", ")}]`;
  }

  // Workaround for: https://github.com/microsoft/TypeScript/issues/17473
  static is(t: KragleType): t is KragleTuple {
    return t instanceof KragleTuple;
  }
}

function kragleTuple<E extends t.KragleTypeArray>(
  ...elements: E
): KragleTuple<E> {
  return new KragleTuple(elements);
}

export { KragleTuple as Tuple, kragleTuple as tuple };
