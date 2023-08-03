import * as t from "./index.js";
import { KragleType } from "./kragle-type.js";

class KragleUndefined extends KragleType<undefined> {
  protected override _isAssignableTo(other: KragleType): boolean {
    return other instanceof KragleUndefined;
  }

  override toString(): string {
    return "undefined";
  }
}

/**
 * @deprecated Use `t.optional()` instead.
 */
function kragleUndefined(): KragleUndefined {
  return new KragleUndefined();
}

function kragleOptional<T extends KragleType>(
  type: T,
): t.Union<readonly [T, t.Undefined]> {
  return t.union(type, t.undefined());
}

export {
  KragleUndefined as Undefined,
  kragleUndefined as undefined,
  kragleOptional as optional,
};
