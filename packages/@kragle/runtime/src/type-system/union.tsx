import * as t from "./index.js";
import { KragleType } from "./kragle-type.js";

class KragleUnion<
  T extends t.KragleTypeArray = t.KragleTypeArray,
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
            element.isAssignableTo(otherElement),
          )
        ) {
          return false;
        }
      }
      return true;
    }
    return this._isAssignableTo(other);
  }

  override canonicalize(): KragleType {
    const result: KragleType[] = [];
    let containsTrue = false;
    let containsFalse = false;

    function addElement(element: t.KragleType) {
      for (const [i, other] of result.entries()) {
        if (element.isAssignableTo(other)) return;
        if (other.isAssignableTo(element)) {
          result[i] = element;
          return;
        }
      }
      result.push(element);
    }

    function addBoolean(element: t.Boolean) {
      switch (element.value) {
        case true:
          containsTrue = true;
          break;
        case false:
          containsFalse = true;
          break;
        case undefined:
          containsTrue = containsFalse = true;
          break;
      }
    }

    for (const element of this.elements.flatMap((e) => {
      const canonicalized = e.canonicalize();
      return KragleUnion.is(canonicalized)
        ? canonicalized.elements
        : [canonicalized];
    })) {
      if (t.Boolean.is(element)) {
        addBoolean(element);
      } else {
        addElement(element);
      }
    }

    if (containsTrue || containsFalse) {
      result.push(
        t.boolean(containsTrue && containsFalse ? undefined : containsTrue),
      );
    }

    return result.length === 1 ? result[0] : new KragleUnion(result);
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

/**
 * Removes `t.undefined()` from `union`.
 *
 * Throws an error if `union` contains nested unions; this can be avoided by
 * calling `union.canonicalize()` first.
 */
function kragleRequired<T extends t.KragleTypeArray>(
  union: KragleUnion<T>,
): KragleType {
  const elements = union.elements.filter((e) => {
    if (KragleUnion.is(e)) {
      throw new Error(`'union' is not 'canonicalize()'d.`);
    }
    return !(e instanceof t.Undefined);
  });
  switch (elements.length) {
    // case 0:
    //   return t.never();
    case 1:
      return elements[0];
    default:
      return new KragleUnion(elements);
  }
}

export {
  KragleUnion as Union,
  kragleUnion as union,
  kragleRequired as required,
};
