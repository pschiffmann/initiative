import { Type } from "./type.js";

class InitiativeNull extends Type<null> {
  protected override _isAssignableTo(other: Type): boolean {
    return other instanceof InitiativeNull;
  }

  override toString(): string {
    return "null";
  }
}

const instance = new InitiativeNull();

function initiativeNull(): InitiativeNull {
  return instance;
}

export { InitiativeNull as Null, initiativeNull as null };
