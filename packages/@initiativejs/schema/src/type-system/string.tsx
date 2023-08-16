import { Type } from "./type.js";

class InitiativeString<T extends string = string> extends Type<T> {
  constructor(readonly value?: T) {
    super();
  }

  protected override _isAssignableTo(other: Type): boolean {
    return (
      InitiativeString.is(other) &&
      (other.value === undefined || other.value === this.value)
    );
  }

  override toString(): string {
    return this.value === undefined
      ? "string"
      : `"${this.value.replaceAll(/["\\]/g, (m) => `\\${m}`)}"`;
  }

  // Workaround for: https://github.com/microsoft/TypeScript/issues/17473
  static is(t: Type): t is InitiativeString {
    return t instanceof InitiativeString;
  }
}

function initiativeString<T extends string>(value?: T): InitiativeString<T> {
  return new InitiativeString(value);
}

export { InitiativeString as String, initiativeString as string };
