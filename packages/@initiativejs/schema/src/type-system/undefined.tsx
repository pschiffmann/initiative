import * as t from "./index.js";
import { Type } from "./type.js";

class InitiativeUndefined extends Type<undefined> {
  protected override _isAssignableTo(other: Type): boolean {
    return other instanceof InitiativeUndefined;
  }

  override toString(): string {
    return "undefined";
  }
}

const instance = new InitiativeUndefined();

/**
 * @deprecated Use `t.optional()` instead.
 */
function initiativeUndefined(): InitiativeUndefined {
  return instance;
}

function initiativeOptional<T extends Type>(
  type: T,
): t.Union<readonly [T, t.Undefined]> {
  return t.union(type, t.undefined());
}

export {
  InitiativeUndefined as Undefined,
  initiativeOptional as optional,
  initiativeUndefined as undefined,
};
