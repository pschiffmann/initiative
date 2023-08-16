import { Type } from "./type.js";

class InitiativeAny extends Type<any> {
  protected override _isAssignableTo(other: Type): boolean {
    return true;
  }

  override toString(): string {
    return "any";
  }
}

function initiativeAny(): InitiativeAny {
  return new InitiativeAny();
}

export { InitiativeAny as Any, initiativeAny as any };
