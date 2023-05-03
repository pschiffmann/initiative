import { KragleType } from "./kragle-type.js";

class KragleEntity<T = unknown> extends KragleType<T> {
  constructor(readonly name: string) {
    super();
  }

  protected override _isAssignableTo(other: KragleType): boolean {
    return this === other;
  }

  override toString(): string {
    return this.name;
  }
}

function kragleEntity<T>(name: string): KragleEntity<T> {
  return new KragleEntity(name);
}

export { KragleEntity as Entity, kragleEntity as entity };
