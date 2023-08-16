import { Type } from "./type.js";

class InitiativeNumber<T extends number = number> extends Type<T> {
  constructor(readonly value?: T) {
    super();
  }

  protected override _isAssignableTo(other: Type): boolean {
    return (
      InitiativeNumber.is(other) &&
      (other.value === undefined || other.value === this.value)
    );
  }

  override toString(): string {
    return this.value === undefined ? "number" : `${this.value}`;
  }

  // Workaround for: https://github.com/microsoft/TypeScript/issues/17473
  static is(t: Type): t is InitiativeNumber {
    return t instanceof InitiativeNumber;
  }
}

function initiativeNumber<T extends number>(value?: T): InitiativeNumber<T> {
  return new InitiativeNumber(value);
}

export { InitiativeNumber as Number, initiativeNumber as number };
