import { KragleType } from "./kragle-type.js";

class KragleVoid extends KragleType<void> {
  protected override _isAssignableTo(): boolean {
    return false;
  }

  override toString(): string {
    return "void";
  }
}

function kragleVoid(): KragleVoid {
  return new KragleVoid();
}

export { KragleVoid as Void, kragleVoid as void };
