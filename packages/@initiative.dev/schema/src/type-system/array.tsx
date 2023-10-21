import * as t from "./index.js";
import { intern } from "./interning.js";
import { Type } from "./type.js";

class InitiativeArray<T extends Type = Type> extends Type<
  readonly t.Unwrap<T>[]
> {
  constructor(readonly element: T) {
    super(() => members(element) as any);
  }

  protected override _isAssignableTo(other: Type): boolean {
    return (
      InitiativeArray.is(other) && this.element.isAssignableTo(other.element)
    );
  }

  protected override _compareTo(other: this): number {
    return this.element.compareTo(other.element);
  }

  override canonicalize(): t.Type {
    return new InitiativeArray(this.element.canonicalize());
  }

  override toString(): string {
    return `${this.element.toString(true)}[]`;
  }

  // Workaround for: https://github.com/microsoft/TypeScript/issues/17473
  static is(t: Type): t is InitiativeArray {
    return t instanceof InitiativeArray;
  }
}

function members<T>(
  element: Type<T>,
): t.Members<Pick<readonly T[], "length" | "at" | "join" | "slice">> {
  return {
    properties: {
      length: {
        type: t.number(),
      },
    },
    methods: {
      at: {
        type: t.function(t.number())()(element),
      },
      join: {
        type: t.function()(t.string())(t.string()),
      },
      slice: {
        type: t.function()(t.number(), t.number())(t.array(element)) as any,
      },
    },
  };
}

function initiativeArray<T extends Type>(element: T): InitiativeArray<T> {
  return intern(
    new InitiativeArray(element).canonicalize(),
  ) as InitiativeArray<T>;
}

export { InitiativeArray as Array, initiativeArray as array };
