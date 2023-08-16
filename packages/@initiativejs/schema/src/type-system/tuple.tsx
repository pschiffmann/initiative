import * as t from "./index.js";
import { Type } from "./type.js";

class InitiativeTuple<E extends t.TypeArray = t.TypeArray> extends Type<
  t.UnwrapArray<E>
> {
  constructor(readonly elements: E) {
    if (elements.length === 0) {
      throw new Error("Tuple cannot be empty.");
    }
    super();
  }

  protected override _isAssignableTo(other: Type): boolean {
    if (t.Array.is(other)) {
      return this.elements.every((element) =>
        element.isAssignableTo(other.element),
      );
    }
    if (InitiativeTuple.is(other)) {
      return (
        this.elements.length === other.elements.length &&
        this.elements.every((element, i) =>
          element.isAssignableTo(other.elements[i]),
        )
      );
    }
    return false;
  }

  override canonicalize(): t.Type {
    return new InitiativeTuple(this.elements.map((e) => e.canonicalize()));
  }

  override toString(): string {
    return `[${this.elements.join(", ")}]`;
  }

  // Workaround for: https://github.com/microsoft/TypeScript/issues/17473
  static is(t: Type): t is InitiativeTuple {
    return t instanceof InitiativeTuple;
  }
}

function initiativeTuple<E extends t.TypeArray>(
  ...elements: E
): InitiativeTuple<E> {
  return new InitiativeTuple(elements);
}

export { InitiativeTuple as Tuple, initiativeTuple as tuple };
