import { Type } from "./type.js";

class InitiativeBoolean extends Type<boolean> {
  constructor() {
    super();
  }

  protected override _isAssignableTo(other: Type): boolean {
    return other instanceof InitiativeBoolean;
  }

  override toString(): string {
    return "boolean";
  }
}

function initiativeBoolean(): InitiativeBoolean {
  return new InitiativeBoolean();
}

export { InitiativeBoolean as Boolean, initiativeBoolean as boolean };
