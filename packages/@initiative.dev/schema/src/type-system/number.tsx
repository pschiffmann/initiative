import * as t from "./index.js";
import { intern } from "./interning.js";
import { Members, Type } from "./type.js";

class InitiativeNumber<T extends number = number> extends Type<T> {
  constructor(readonly value?: T) {
    super(members as any);
  }

  protected override _isAssignableTo(other: Type): boolean {
    return (
      InitiativeNumber.is(other) &&
      (other.value === undefined || other.value === this.value)
    );
  }

  protected _compareTo(other: this): number {
    if (this.value === other.value) return 0;
    if (this.value === undefined) return -1;
    if (other.value === undefined) return 1;
    return this.value - other.value;
  }

  override toString(): string {
    return this.value === undefined ? "number" : `${this.value}`;
  }

  // Workaround for: https://github.com/microsoft/TypeScript/issues/17473
  static is(t: Type): t is InitiativeNumber {
    return t instanceof InitiativeNumber;
  }
}

function members(): Members<
  Pick<number, "toExponential" | "toFixed" | "toPrecision" | "toString">
> {
  return {
    methods: {
      toExponential: {
        type: t.function()(t.number())(t.string()),
      },
      toFixed: {
        type: t.function()(t.number())(t.string()),
      },
      toPrecision: {
        type: t.function()(t.number())(t.string()),
      },
      toString: {
        type: t.function()(t.number())(t.string()),
      },
    },
  };
}

function initiativeNumber<T extends number>(value?: T): InitiativeNumber<T> {
  return intern(new InitiativeNumber(value));
}

export { InitiativeNumber as Number, initiativeNumber as number };
