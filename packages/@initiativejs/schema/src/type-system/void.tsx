import { Type } from "./type.js";

class InitiativeVoid extends Type<void> {
  protected override _isAssignableTo(): boolean {
    return false;
  }

  override toString(): string {
    return "void";
  }
}

function initiativeVoid(): InitiativeVoid {
  return new InitiativeVoid();
}

export { InitiativeVoid as Void, initiativeVoid as void };
