import { KragleType } from "./kragle-type.js";

class KragleAny extends KragleType<any> {
  protected override _isAssignableTo(other: KragleType): boolean {
    return true;
  }

  override toString(): string {
    return "any";
  }
}

function kragleAny(): KragleAny {
  return new KragleAny();
}

export { KragleAny as Any, kragleAny as any };
