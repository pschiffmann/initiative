import * as t from "./index.js";
import { Type } from "./type.js";

class InitiativeUnion<T extends t.TypeArray = t.TypeArray> extends Type<
  t.Unwrap<T[number]>
> {
  constructor(readonly elements: T) {
    if (elements.length === 0) {
      throw new Error("Union cannot be empty.");
    }
    super();
  }

  override isAssignableTo(other: Type): boolean {
    if (InitiativeUnion.is(other)) {
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

  override canonicalize(): Type {
    const result: Type[] = [];

    function addElement(element: t.Type) {
      for (const [i, other] of result.entries()) {
        if (element.isAssignableTo(other)) return;
        if (other.isAssignableTo(element)) {
          result[i] = element;
          return;
        }
      }
      result.push(element);
    }

    for (const element of this.elements.flatMap((e) => {
      const canonicalized = e.canonicalize();
      return InitiativeUnion.is(canonicalized)
        ? canonicalized.elements
        : [canonicalized];
    })) {
      addElement(element);
    }

    return result.length === 1
      ? result[0]
      : new InitiativeUnion(result.sort((a, b) => a.compareTo(b)));
  }

  protected override _isAssignableTo(other: Type): boolean {
    return this.elements.every((element) => element.isAssignableTo(other));
  }

  protected _compareTo(other: this): number {
    const elementCount = Math.max(this.elements.length, other.elements.length);
    for (let i = 0; i < elementCount; i++) {
      const comparison = (this.elements[i] ?? t.undefined()).compareTo(
        other.elements[i] ?? t.undefined(),
      );
      if (comparison !== 0) return comparison;
    }
    return 0;
  }

  override toString(addBrackets?: boolean): string {
    const result = this.elements
      .map((element) => element.toString(true))
      .join(" | ");
    return addBrackets ? `(${result})` : result;
  }

  // Workaround for: https://github.com/microsoft/TypeScript/issues/17473
  static is(t: Type): t is InitiativeUnion {
    return t instanceof InitiativeUnion;
  }
}

function initiativeUnion<T extends t.TypeArray>(
  ...elements: T
): InitiativeUnion<T> {
  return new InitiativeUnion<T>(elements);
}

/**
 * Removes `t.undefined()` from `union`.
 *
 * Throws an error if `union` contains nested unions; this can be avoided by
 * calling `union.canonicalize()` first.
 */
function initiativeRequired<T extends t.TypeArray>(
  union: InitiativeUnion<T>,
): Type {
  const elements = union.elements.filter((e) => {
    if (InitiativeUnion.is(e)) {
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
      return new InitiativeUnion(elements);
  }
}

export {
  InitiativeUnion as Union,
  initiativeRequired as required,
  initiativeUnion as union,
};
