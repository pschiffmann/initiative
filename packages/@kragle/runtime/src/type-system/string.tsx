import { KragleType } from "./kragle-type.js";

class KragleString<T extends string = string> extends KragleType<T> {
  constructor(readonly value?: T) {
    super();
  }

  protected override _isAssignableTo(other: KragleType): boolean {
    return (
      KragleString.is(other) &&
      (other.value === undefined || other.value === this.value)
    );
  }

  override toString(): string {
    return this.value === undefined
      ? "string"
      : `"${this.value.replaceAll(/["\\]/g, (m) => `\\${m}`)}"`;
  }

  // Workaround for: https://github.com/microsoft/TypeScript/issues/17473
  static is(t: KragleType): t is KragleString {
    return t instanceof KragleString;
  }
}

function kragleString<T extends string>(value?: T): KragleString<T> {
  return new KragleString(value);
}

export { KragleString as String, kragleString as string };
