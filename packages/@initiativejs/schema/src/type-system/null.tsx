import { Type } from "./type.js";

class InitiativeNull extends Type<null> {
  protected override _isAssignableTo(other: Type): boolean {
    return other instanceof InitiativeNull;
  }

  override toString(): string {
    return "null";
  }
}

function initiativeNull(): InitiativeNull {
  return new InitiativeNull();
}

export { InitiativeNull as Null, initiativeNull as null };
