import * as t from "./index.js";
import { KragleType } from "./kragle-type.js";

class KragleUnion<
  T extends t.KragleTypeArray = t.KragleTypeArray
> extends KragleType<t.Unwrap<T[number]>> {
  constructor(readonly elements: T) {
    if (elements.length === 0) {
      throw new Error("Union cannot be empty.");
    }
    super();
  }

  override isAssignableTo(other: KragleType): boolean {
    if (KragleUnion.is(other)) {
      for (const element of this.elements) {
        if (
          !other.elements.some((otherElement) =>
            element.isAssignableTo(otherElement)
          )
        ) {
          return false;
        }
      }
      return true;
    }
    return this._isAssignableTo(other);
  }

  protected override _isAssignableTo(other: KragleType): boolean {
    return this.elements.every((element) => element.isAssignableTo(other));
  }

  override toString(addBrackets?: boolean): string {
    const result = this.elements
      .map((element) => element.toString(true))
      .join(" | ");
    return addBrackets ? `(${result})` : result;
  }

  // Workaround for: https://github.com/microsoft/TypeScript/issues/17473
  static is(t: KragleType): t is KragleUnion {
    return t instanceof KragleUnion;
  }
}

function kragleUnion<T extends t.KragleTypeArray>(
  ...elements: T
): KragleUnion<T> {
  return new KragleUnion<T>(elements);
}

function collapseTrueFalse(elements: t.KragleTypeArray): t.KragleTypeArray {
  let containsTrue = false;
  let containsFalse = false;
  for (const element of elements) {
    if (!t.Boolean.is(element)) continue;
    switch (element.value) {
      case true:
        containsTrue = true;
        break;
      case false:
        containsFalse = true;
        break;
    }
  }
  return containsTrue && containsFalse
    ? [...elements.filter((e) => !t.Boolean.is(e)), t.boolean()]
    : elements;
}

function flattenNestedUnions(elements: t.KragleTypeArray): t.KragleTypeArray {
  return elements.flatMap((e) => (KragleUnion.is(e) ? e.elements : e));
}

export { KragleUnion as Union, kragleUnion as union };
