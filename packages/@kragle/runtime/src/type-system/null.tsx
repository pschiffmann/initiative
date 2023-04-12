import { KragleType } from "./kragle-type.js";

class KragleNull extends KragleType<null> {
  protected override _isAssignableTo(other: KragleType): boolean {
    return other instanceof KragleNull;
  }

  override toString(): string {
    return "null";
  }
}

function kragleNull(): KragleNull {
  return new KragleNull();
}

export { KragleNull as Null, kragleNull as null };
