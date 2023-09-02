import { Type } from "./type.js";

class InitiativeVoid extends Type<void> {
  protected override _isAssignableTo(): boolean {
    return false;
  }

  override toString(): string {
    return "void";
  }
}

const instance = new InitiativeVoid();

function initiativeVoid(): InitiativeVoid {
  return instance;
}

export { InitiativeVoid as Void, initiativeVoid as void };
