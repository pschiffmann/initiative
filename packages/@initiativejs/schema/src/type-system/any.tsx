import { Type } from "./type.js";

class InitiativeAny extends Type<any> {
  protected override _isAssignableTo(other: Type): boolean {
    return true;
  }

  override toString(): string {
    return "any";
  }
}

const instance = new InitiativeAny();

function initiativeAny(): InitiativeAny {
  return instance;
}

export { InitiativeAny as Any, initiativeAny as any };
